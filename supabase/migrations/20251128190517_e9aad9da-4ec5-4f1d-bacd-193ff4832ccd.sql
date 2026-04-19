-- Add platform fee tracking and withdrawal system

-- Add platform fee percentage to campaigns (defaults to 7%)
ALTER TABLE public.funding_campaigns
ADD COLUMN platform_fee_percentage numeric DEFAULT 7 CHECK (platform_fee_percentage >= 0 AND platform_fee_percentage <= 100);

-- Add available balance for withdrawal (separate from display amount)
ALTER TABLE public.funding_campaigns
ADD COLUMN available_balance numeric DEFAULT 0;

-- Create withdrawal requests table
CREATE TABLE public.campaign_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.funding_campaigns(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  bank_code text NOT NULL,
  account_number text NOT NULL,
  account_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  rejection_reason text,
  processed_by uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create platform revenue tracking table
CREATE TABLE public.platform_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES public.campaign_donations(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.funding_campaigns(id) ON DELETE CASCADE,
  fee_percentage numeric NOT NULL,
  fee_amount numeric NOT NULL,
  donation_amount numeric NOT NULL,
  creator_amount numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_revenue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for withdrawals
CREATE POLICY "Campaign creators can view their withdrawal requests"
  ON public.campaign_withdrawals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.funding_campaigns fc
      WHERE fc.id = campaign_withdrawals.campaign_id
      AND fc.created_by = auth.uid()
    )
  );

CREATE POLICY "Campaign creators can create withdrawal requests"
  ON public.campaign_withdrawals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.funding_campaigns fc
      WHERE fc.id = campaign_withdrawals.campaign_id
      AND fc.created_by = auth.uid()
    )
    AND creator_id = auth.uid()
  );

CREATE POLICY "Admins can manage all withdrawals"
  ON public.campaign_withdrawals FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for platform revenue
CREATE POLICY "Admins can view platform revenue"
  ON public.platform_revenue FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can create revenue records"
  ON public.platform_revenue FOR INSERT
  WITH CHECK (true);

-- Trigger for updating withdrawal timestamps
CREATE TRIGGER update_campaign_withdrawals_updated_at
  BEFORE UPDATE ON public.campaign_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_campaign_withdrawals_campaign_id ON public.campaign_withdrawals(campaign_id);
CREATE INDEX idx_campaign_withdrawals_status ON public.campaign_withdrawals(status);
CREATE INDEX idx_platform_revenue_campaign_id ON public.platform_revenue(campaign_id);
CREATE INDEX idx_platform_revenue_created_at ON public.platform_revenue(created_at);