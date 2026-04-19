import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook signature
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    // Use Web Crypto API for HMAC verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(paystackSecretKey!),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const hash = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    // Handle successful charge
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;
      const donationId = reference; // We used donation ID as reference
      
      console.log('Processing successful payment:', { donationId, amount });

      // Get the donation
      const { data: donation, error: fetchError } = await supabase
        .from('campaign_donations')
        .select('*, funding_campaigns!inner(current_amount, available_balance, total_donors, platform_fee_percentage)')
        .eq('id', donationId)
        .single();

      if (fetchError || !donation) {
        console.error('Donation not found:', fetchError);
        throw new Error('Donation not found');
      }

      const feePercentage = donation.funding_campaigns.platform_fee_percentage || 7;
      const donationAmount = amount / 100; // Convert from kobo to naira
      const platformFee = (donationAmount * feePercentage) / 100;
      const creatorAmount = donationAmount - platformFee;

      console.log('Payment split:', {
        donation: donationAmount,
        platformFee: platformFee,
        creatorAmount: creatorAmount,
        feePercentage: feePercentage
      });

      // Update donation status to approved
      const { error: updateError } = await supabase
        .from('campaign_donations')
        .update({
          payment_status: 'approved',
          payment_reference: reference,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', donationId);

      if (updateError) {
        console.error('Error updating donation:', updateError);
        throw updateError;
      }

      // Record platform revenue
      const { error: revenueError } = await supabase
        .from('platform_revenue')
        .insert({
          donation_id: donationId,
          campaign_id: donation.campaign_id,
          fee_percentage: feePercentage,
          fee_amount: platformFee,
          donation_amount: donationAmount,
          creator_amount: creatorAmount,
        });

      if (revenueError) {
        console.error('Error recording revenue:', revenueError);
      }

      // Update campaign: current_amount shows full donation, available_balance shows creator amount
      const currentAmount = donation.funding_campaigns.current_amount || 0;
      const availableBalance = donation.funding_campaigns.available_balance || 0;
      const totalDonors = donation.funding_campaigns.total_donors || 0;

      const { error: campaignError } = await supabase
        .from('funding_campaigns')
        .update({
          current_amount: currentAmount + donationAmount,
          available_balance: availableBalance + creatorAmount,
          total_donors: totalDonors + 1,
        })
        .eq('id', donation.campaign_id);

      if (campaignError) {
        console.error('Error updating campaign:', campaignError);
        throw campaignError;
      }

      console.log('Payment processed successfully');
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in paystack-webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
