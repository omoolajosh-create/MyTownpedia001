import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get pending notifications
    const { data: notifications, error: notifError } = await supabaseClient
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .limit(10);

    if (notifError) throw notifError;

    console.log(`Processing ${notifications?.length || 0} notifications`);

    // Process each notification
    for (const notification of notifications || []) {
      try {
        // Get user's push subscriptions
        const { data: subscriptions } = await supabaseClient
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', notification.user_id);

        if (!subscriptions || subscriptions.length === 0) {
          console.log(`No subscriptions for user ${notification.user_id}`);
          await supabaseClient
            .from('notification_queue')
            .update({ status: 'failed' })
            .eq('id', notification.id);
          continue;
        }

        // Send to all user subscriptions
        for (const sub of subscriptions) {
          try {
            // Here you would use Web Push library to send actual push notification
            // For now, we'll just mark as sent and create a browser notification via the notifications table
            await supabaseClient
              .from('notifications')
              .insert({
                user_id: notification.user_id,
                title: notification.title,
                message: notification.body,
                notification_type: notification.notification_type,
                is_read: false,
              });

            console.log(`Notification sent to user ${notification.user_id}`);
          } catch (error) {
            console.error('Error sending to subscription:', error);
          }
        }

        // Mark notification as sent
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'sent', sent_at: new Date().toISOString() })
          .eq('id', notification.id);

      } catch (error) {
        console.error('Error processing notification:', error);
        await supabaseClient
          .from('notification_queue')
          .update({ status: 'failed' })
          .eq('id', notification.id);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: notifications?.length || 0 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
