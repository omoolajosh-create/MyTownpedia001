import webpush from 'npm:web-push'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-notify-secret',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const expectedSecret = Deno.env.get('NOTIFY_INTERNAL_SECRET')
  if (!expectedSecret || req.headers.get('x-notify-secret') !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  try {
    const body = await req.json()
    const title = body.title || 'New MyTownpedia update'
    const notificationBody = body.body || 'New content is waiting for your review.'
    const url = body.url || '/admin/content-approval'
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    webpush.setVapidDetails(
      Deno.env.get('VAPID_SUBJECT') || 'mailto:araromiobo.heritage@gmail.com',
      Deno.env.get('VAPID_PUBLIC_KEY')!,
      Deno.env.get('VAPID_PRIVATE_KEY')!,
    )

    const { data: subscriptions, error } = await supabase
      .from('admin_push_subscriptions')
      .select('id, endpoint, p256dh, auth')
    if (error) throw error

    const payload = JSON.stringify({ title, body: notificationBody, url, tag: 'mytownpedia-pending-content' })
    let sent = 0
    let removed = 0
    for (const subscription of subscriptions || []) {
      try {
        await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, payload)
        sent += 1
      } catch (sendError: any) {
        // 404/410 means the browser subscription has expired or was revoked.
        if (sendError?.statusCode === 404 || sendError?.statusCode === 410) {
          await supabase.from('admin_push_subscriptions').delete().eq('id', subscription.id)
          removed += 1
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, removed, total: subscriptions?.length || 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Notification failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
