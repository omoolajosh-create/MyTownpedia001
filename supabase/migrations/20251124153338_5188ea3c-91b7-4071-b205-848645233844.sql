-- Allow campaign creators to delete their own campaigns
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.funding_campaigns;
CREATE POLICY "Users can delete their own campaigns" 
ON public.funding_campaigns 
FOR DELETE 
USING (auth.uid() = created_by);