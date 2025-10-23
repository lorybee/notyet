-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  city TEXT,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create compensation_data table (anonymized)
CREATE TABLE public.compensation_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id UUID DEFAULT gen_random_uuid() NOT NULL,
  country TEXT DEFAULT 'Romania' NOT NULL,
  city TEXT NOT NULL,
  industry TEXT NOT NULL,
  job_title TEXT NOT NULL,
  company_size TEXT NOT NULL CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  gross_salary DECIMAL(10, 2) NOT NULL,
  net_salary DECIMAL(10, 2) NOT NULL,
  tenure_years INTEGER,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'lead')),
  contract_type TEXT CHECK (contract_type IN ('permanent', 'fixed-term', 'contractor')),
  schedule TEXT CHECK (schedule IN ('full-time', 'part-time')),
  work_model TEXT CHECK (work_model IN ('on-site', 'hybrid', 'remote')),
  has_meal_vouchers BOOLEAN DEFAULT false,
  meal_vouchers_value DECIMAL(10, 2),
  has_health_insurance BOOLEAN DEFAULT false,
  has_life_insurance BOOLEAN DEFAULT false,
  paid_leave_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS - anonymous data, publicly readable for benchmarking
ALTER TABLE public.compensation_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert compensation data"
  ON public.compensation_data FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Compensation data is readable by authenticated users"
  ON public.compensation_data FOR SELECT
  TO authenticated
  USING (true);

-- Create benchmark_data table (pre-seeded averages)
CREATE TABLE public.benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT DEFAULT 'Romania' NOT NULL,
  city TEXT NOT NULL,
  industry TEXT NOT NULL,
  company_size TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  avg_gross_salary DECIMAL(10, 2) NOT NULL,
  avg_net_salary DECIMAL(10, 2) NOT NULL,
  avg_benefits_value DECIMAL(10, 2),
  p25_total_rewards DECIMAL(10, 2),
  p50_total_rewards DECIMAL(10, 2),
  p75_total_rewards DECIMAL(10, 2),
  sample_size INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.benchmark_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Benchmark data is readable by authenticated users"
  ON public.benchmark_data FOR SELECT
  TO authenticated
  USING (true);

-- Create inflation_data table
CREATE TABLE public.inflation_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT DEFAULT 'Romania' NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  cpi_index DECIMAL(10, 4) NOT NULL,
  cumulative_inflation DECIMAL(10, 4),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(country, year, month)
);

-- Enable RLS
ALTER TABLE public.inflation_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Inflation data is publicly readable"
  ON public.inflation_data FOR SELECT
  TO authenticated
  USING (true);

-- Create legislation_articles table
CREATE TABLE public.legislation_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('medical-leave', 'paid-leave', 'meal-vouchers', 'hybrid-work', 'minimum-wage', 'maternity-paternity')),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  legal_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.legislation_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Legislation articles are publicly readable"
  ON public.legislation_articles FOR SELECT
  TO authenticated
  USING (true);

-- Create trigger for profiles updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_benchmark_data_updated_at
  BEFORE UPDATE ON public.benchmark_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legislation_articles_updated_at
  BEFORE UPDATE ON public.legislation_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some mock benchmark data for demonstration
INSERT INTO public.benchmark_data (country, city, industry, company_size, experience_level, avg_gross_salary, avg_net_salary, avg_benefits_value, p25_total_rewards, p50_total_rewards, p75_total_rewards, sample_size) VALUES
('Romania', 'București', 'IT & Software', '51-200', 'mid', 12000, 7200, 500, 7000, 7700, 8500, 150),
('Romania', 'București', 'IT & Software', '51-200', 'senior', 18000, 10800, 800, 10500, 11600, 13000, 120),
('Romania', 'Cluj-Napoca', 'IT & Software', '51-200', 'mid', 11000, 6600, 450, 6400, 7050, 7800, 100),
('Romania', 'Iași', 'Human Resources', '11-50', 'mid', 6500, 3900, 300, 3800, 4200, 4700, 80),
('Romania', 'București', 'Finance', '201-500', 'senior', 15000, 9000, 700, 8800, 9700, 10800, 90);

-- Insert mock inflation data (2020-2025)
INSERT INTO public.inflation_data (country, year, month, cpi_index, cumulative_inflation) VALUES
('Romania', 2020, 10, 100.0, 0.0),
('Romania', 2021, 10, 104.2, 4.2),
('Romania', 2022, 10, 118.5, 18.5),
('Romania', 2023, 10, 124.3, 24.3),
('Romania', 2024, 10, 126.1, 26.1),
('Romania', 2025, 10, 127.0, 27.0);

-- Insert mock legislation articles
INSERT INTO public.legislation_articles (category, question, answer, legal_reference) VALUES
('paid-leave', 'What is the minimum paid leave in Romania?', 'The legal minimum is 20 days per year for full-time employees. Some contracts may offer more.', 'Labour Code Art. 145'),
('meal-vouchers', 'How are meal vouchers taxed?', 'Meal vouchers are taxed 10% income tax + 10% CASS (health contribution). This amount is deducted from your base salary.', 'Tax Code Art. 76'),
('hybrid-work', 'Do I have a right to work from home?', 'Hybrid work is not a legal right but a contractual arrangement. It must be agreed upon with your employer and stated in your employment contract or addendum.', 'Labour Code Art. 108'),
('minimum-wage', 'What is the minimum wage in Romania?', 'As of 2025, the gross minimum wage is 3,700 RON per month for full-time employment. This translates to approximately 2,363 RON net.', 'Government Decision'),
('maternity-paternity', 'How long is maternity leave?', 'Maternity leave is 126 days (approximately 4 months) with 85% of the average gross salary paid as benefits, capped at a maximum amount.', 'Law 448/2006'),
('medical-leave', 'Am I paid during medical leave?', 'Yes. Medical leave is compensated at 75% of your gross salary after the first 3 days of illness, which are unpaid unless your employer covers them.', 'Law 95/2006');
