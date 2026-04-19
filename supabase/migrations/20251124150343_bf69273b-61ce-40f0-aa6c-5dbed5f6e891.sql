-- Add account_details column to funding_campaigns table
ALTER TABLE public.funding_campaigns
ADD COLUMN account_details TEXT;

COMMENT ON COLUMN public.funding_campaigns.account_details IS 'Bank account details where campaign creator receives donations';