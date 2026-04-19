import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { amount, email, campaignId, donorName, donorMessage, isAnonymous, userId } = await req.json();

    console.log('Initializing Paystack payment:', { amount, email, campaignId, donorName });

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('funding_campaigns')
      .select('title, platform_fee_percentage')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      throw new Error('Campaign not found');
    }

    // Create pending donation record
    const { data: donation, error: donationError } = await supabase
      .from('campaign_donations')
      .insert({
        campaign_id: campaignId,
        amount: amount,
        donor_name: donorName,
        donor_message: donorMessage,
        is_anonymous: isAnonymous,
        payment_status: 'pending',
        donor_id: userId,
      })
      .select()
      .single();

    if (donationError) {
      console.error('Error creating donation:', donationError);
      throw donationError;
    }

    console.log('Donation record created:', donation.id);

    // Initialize Paystack payment (goes to platform account)
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        currency: 'NGN',
        reference: donation.id, // Use donation ID as reference
        metadata: {
          donation_id: donation.id,
          campaign_id: campaignId,
          donor_name: donorName,
          platform_fee_percentage: campaign.platform_fee_percentage,
        },
        callback_url: `${req.headers.get('origin')}/crowdfunding/${campaignId}?donation_id=${donation.id}`,
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error('Paystack initialization failed:', paystackData);
      throw new Error(paystackData.message || 'Failed to initialize payment');
    }

    console.log('Paystack payment initialized successfully');

    return new Response(
      JSON.stringify({
        authorizationUrl: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        donationId: donation.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in paystack-initialize:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
