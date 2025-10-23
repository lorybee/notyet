-- Fix 1: Drop insecure RLS policy on compensation_data
DROP POLICY IF EXISTS "Anyone can insert compensation data" ON compensation_data;

-- Fix 2: Create secure RLS policy requiring authentication and one submission per user
CREATE POLICY "Authenticated users can insert their compensation once"
ON compensation_data FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND
  NOT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM compensation_data cd
      WHERE cd.anonymous_id = p.anonymous_compensation_id
    )
  )
);

-- Fix 3: Add database constraints for input validation
-- Salary range constraints (reasonable for Romania: 2000-100000 RON gross)
ALTER TABLE compensation_data
  ADD CONSTRAINT valid_gross_salary CHECK (gross_salary >= 2000 AND gross_salary <= 100000),
  ADD CONSTRAINT valid_net_salary CHECK (net_salary >= 1500 AND net_salary <= 75000);

-- Tenure validation (0-50 years)
ALTER TABLE compensation_data
  ADD CONSTRAINT valid_tenure CHECK (tenure_years IS NULL OR (tenure_years >= 0 AND tenure_years <= 50));

-- Paid leave days validation (0-50 days)
ALTER TABLE compensation_data
  ADD CONSTRAINT valid_paid_leave CHECK (paid_leave_days IS NULL OR (paid_leave_days >= 0 AND paid_leave_days <= 50));

-- Meal vouchers value validation (0-1000 RON per month)
ALTER TABLE compensation_data
  ADD CONSTRAINT valid_meal_vouchers CHECK (meal_vouchers_value IS NULL OR (meal_vouchers_value >= 0 AND meal_vouchers_value <= 1000));

-- Text length constraints
ALTER TABLE compensation_data
  ADD CONSTRAINT valid_text_lengths CHECK (
    length(job_title) <= 100 AND
    length(industry) <= 100 AND
    length(city) <= 100
  );

-- Fix 4: Create enums for validated fields
CREATE TYPE company_size_enum AS ENUM ('1-10', '11-50', '51-200', '201-500', '500+');
CREATE TYPE experience_level_enum AS ENUM ('Entry Level (0-2 years)', 'Junior (2-5 years)', 'Mid-Level (5-10 years)', 'Senior (10+ years)');
CREATE TYPE contract_type_enum AS ENUM ('Full-time', 'Part-time', 'Contract', 'Freelance');
CREATE TYPE work_model_enum AS ENUM ('Remote', 'Hybrid', 'On-site');
CREATE TYPE schedule_enum AS ENUM ('8 hours/day', 'Flexible', 'Shift work');

-- Convert existing columns to use enums (first add temp columns, copy data, drop old, rename)
ALTER TABLE compensation_data ADD COLUMN company_size_new company_size_enum;
UPDATE compensation_data SET company_size_new = 
  CASE company_size
    WHEN '1-10' THEN '1-10'::company_size_enum
    WHEN '11-50' THEN '11-50'::company_size_enum
    WHEN '51-200' THEN '51-200'::company_size_enum
    WHEN '201-500' THEN '201-500'::company_size_enum
    WHEN '500+' THEN '500+'::company_size_enum
    ELSE '11-50'::company_size_enum
  END;
ALTER TABLE compensation_data DROP COLUMN company_size;
ALTER TABLE compensation_data RENAME COLUMN company_size_new TO company_size;
ALTER TABLE compensation_data ALTER COLUMN company_size SET NOT NULL;

ALTER TABLE compensation_data ADD COLUMN experience_level_new experience_level_enum;
UPDATE compensation_data SET experience_level_new = 
  CASE experience_level
    WHEN 'Entry Level (0-2 years)' THEN 'Entry Level (0-2 years)'::experience_level_enum
    WHEN 'Junior (2-5 years)' THEN 'Junior (2-5 years)'::experience_level_enum
    WHEN 'Mid-Level (5-10 years)' THEN 'Mid-Level (5-10 years)'::experience_level_enum
    WHEN 'Senior (10+ years)' THEN 'Senior (10+ years)'::experience_level_enum
    ELSE 'Mid-Level (5-10 years)'::experience_level_enum
  END;
ALTER TABLE compensation_data DROP COLUMN experience_level;
ALTER TABLE compensation_data RENAME COLUMN experience_level_new TO experience_level;
ALTER TABLE compensation_data ALTER COLUMN experience_level SET NOT NULL;

ALTER TABLE compensation_data ADD COLUMN contract_type_new contract_type_enum;
UPDATE compensation_data SET contract_type_new = 
  CASE contract_type
    WHEN 'Full-time' THEN 'Full-time'::contract_type_enum
    WHEN 'Part-time' THEN 'Part-time'::contract_type_enum
    WHEN 'Contract' THEN 'Contract'::contract_type_enum
    WHEN 'Freelance' THEN 'Freelance'::contract_type_enum
    ELSE 'Full-time'::contract_type_enum
  END;
ALTER TABLE compensation_data DROP COLUMN contract_type;
ALTER TABLE compensation_data RENAME COLUMN contract_type_new TO contract_type;

ALTER TABLE compensation_data ADD COLUMN work_model_new work_model_enum;
UPDATE compensation_data SET work_model_new = 
  CASE work_model
    WHEN 'Remote' THEN 'Remote'::work_model_enum
    WHEN 'Hybrid' THEN 'Hybrid'::work_model_enum
    WHEN 'On-site' THEN 'On-site'::work_model_enum
    ELSE 'Hybrid'::work_model_enum
  END;
ALTER TABLE compensation_data DROP COLUMN work_model;
ALTER TABLE compensation_data RENAME COLUMN work_model_new TO work_model;

ALTER TABLE compensation_data ADD COLUMN schedule_new schedule_enum;
UPDATE compensation_data SET schedule_new = 
  CASE schedule
    WHEN '8 hours/day' THEN '8 hours/day'::schedule_enum
    WHEN 'Flexible' THEN 'Flexible'::schedule_enum
    WHEN 'Shift work' THEN 'Shift work'::schedule_enum
    ELSE '8 hours/day'::schedule_enum
  END;
ALTER TABLE compensation_data DROP COLUMN schedule;
ALTER TABLE compensation_data RENAME COLUMN schedule_new TO schedule;

-- Fix 5: Update function search_path to fix Supabase linter warning (use CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;