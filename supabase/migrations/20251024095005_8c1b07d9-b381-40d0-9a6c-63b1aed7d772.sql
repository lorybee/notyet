-- Add UPDATE policy for compensation_data so users can update their own data
-- Users can only update records that belong to their anonymous_compensation_id

CREATE POLICY "Users can update their own compensation data" 
ON public.compensation_data
FOR UPDATE 
TO authenticated
USING (
  anonymous_id = (
    SELECT anonymous_compensation_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  anonymous_id = (
    SELECT anonymous_compensation_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);