-- Add account details field to campaign_donations
ALTER TABLE public.campaign_donations 
ADD COLUMN IF NOT EXISTS account_details TEXT;

-- Add reviewed_by and reviewed_at fields for admin tracking
ALTER TABLE public.campaign_donations 
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Update RLS policies for campaign_donations to allow admins to update status
CREATE POLICY "Admins can update donation status"
ON public.campaign_donations
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));