-- Add admin delete policy for towns (currently no one can delete towns)
CREATE POLICY "Admins can delete towns"
ON public.towns
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));