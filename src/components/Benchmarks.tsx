import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, TrendingDown } from "lucide-react";

interface CompensationData {
  gross_salary: number;
  net_salary: number;
  experience_level: string;
  city: string;
  company_size: string;
  job_title: string;
  industry: string;
  contract_type: string;
  tenure_years: number;
  work_model: string;
  has_meal_vouchers: boolean;
  meal_vouchers_value: number;
  has_health_insurance: boolean;
  has_life_insurance: boolean;
  paid_leave_days: number;
}

interface UserProfile extends CompensationData {
  total_compensation: number;
  percentile: number;
  sample_size: number;
}

interface SalaryDistribution {
  experience_level: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  avg: number;
  count: number;
}

interface CompanySizeSalary {
  company_size: string;
  avg_net_salary: number;
  count: number;
}

interface BenefitStats {
  meal_vouchers_pct: number;
  avg_meal_value: number;
  health_insurance_pct: number;
  life_insurance_pct: number;
  sample_size: number;
}

interface PaidLeaveComparison {
  user_days: number;
  avg_days: number;
  top_10_pct_days: number;
}

interface TenureData {
  experience_level: string;
  avg_tenure: number;
}

const COLORS = {
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  accent: 'hsl(var(--accent))',
  muted: 'hsl(var(--muted))',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(48, 96%, 53%)',
  danger: 'hsl(0, 84%, 60%)',
  info: 'hsl(217, 91%, 60%)',
};

const EXP_LEVELS = ['junior', 'mid', 'senior', 'lead'];
const COMPANY_SIZES = ['1-50', '51-200', '201-1000', '1000+'];

export const Benchmarks = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [salaryDistGross, setSalaryDistGross] = useState<SalaryDistribution[]>([]);
  const [salaryDistNet, setSalaryDistNet] = useState<SalaryDistribution[]>([]);
  const [companySizeSalaries, setCompanySizeSalaries] = useState<CompanySizeSalary[]>([]);
  const [benefitStats, setBenefitStats] = useState<BenefitStats | null>(null);
  const [paidLeave, setPaidLeave] = useState<PaidLeaveComparison | null>(null);
  const [workModelDist, setWorkModelDist] = useState<any[]>([]);
  const [contractTypeDist, setContractTypeDist] = useState<any[]>([]);
  const [tenureData, setTenureData] = useState<TenureData[]>([]);

  useEffect(() => {
    // Clear all state before fetching
    setUserProfile(null);
    setSalaryDistGross([]);
    setSalaryDistNet([]);
    setCompanySizeSalaries([]);
    setBenefitStats(null);
    setPaidLeave(null);
    setWorkModelDist([]);
    setContractTypeDist([]);
    setTenureData([]);
    
    fetchBenchmarks();

    // Subscribe to auth changes to refetch when user changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchBenchmarks();
      } else if (event === 'SIGNED_OUT') {
        // Clear all data on sign out
        setUserProfile(null);
        setSalaryDistGross([]);
        setSalaryDistNet([]);
        setCompanySizeSalaries([]);
        setBenefitStats(null);
        setPaidLeave(null);
        setWorkModelDist([]);
        setContractTypeDist([]);
        setTenureData([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const calculatePercentile = (value: number, sortedValues: number[]): number => {
    const index = sortedValues.findIndex(v => v >= value);
    if (index === -1) return 100;
    return Math.round((index / sortedValues.length) * 100);
  };

  const calculateQuartiles = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const medianIndex = Math.floor(sorted.length * 0.5);
    const q3Index = Math.floor(sorted.length * 0.75);
    return {
      min: sorted[0],
      q1: sorted[q1Index],
      median: sorted[medianIndex],
      q3: sorted[q3Index],
      max: sorted[sorted.length - 1],
    };
  };

  const fetchBenchmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's anonymous compensation ID from profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("anonymous_compensation_id, city, industry")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile?.anonymous_compensation_id) {
        toast({
          title: "No data found",
          description: "Please complete your compensation profile first.",
          variant: "destructive",
        });
        return;
      }

      // Fetch all compensation data
      const { data: allData, error: allError } = await supabase
        .from("compensation_data")
        .select("*");

      if (allError) throw allError;
      if (!allData || allData.length === 0) return;

      // Get user's compensation data using anonymous ID
      const { data: userCompData } = await supabase
        .from("compensation_data")
        .select("*")
        .eq("anonymous_id", profile.anonymous_compensation_id)
        .maybeSingle();

      if (!userCompData) {
        toast({
          title: "No data found",
          description: "Please complete your compensation profile first.",
          variant: "destructive",
        });
        return;
      }

      const userData = userCompData as CompensationData;

      // 1. USER PROFILE WITH PERCENTILE
      const cityData = allData.filter((d: any) => d.city === userData.city);
      const similarProfiles = cityData.filter((d: any) => 
        d.job_title === userData.job_title || d.industry === userData.industry
      );
      
      const totalCompValues = similarProfiles
        .map((d: any) => Number(d.gross_salary) + (d.meal_vouchers_value ? Number(d.meal_vouchers_value) * 20 : 0))
        .sort((a, b) => a - b);
      
      const userTotalComp = Number(userData.gross_salary) + 
        (userData.meal_vouchers_value ? Number(userData.meal_vouchers_value) * 20 : 0);
      
      const percentile = calculatePercentile(userTotalComp, totalCompValues);

      setUserProfile({
        ...userData,
        gross_salary: Number(userData.gross_salary),
        net_salary: Number(userData.net_salary),
        tenure_years: Number(userData.tenure_years),
        meal_vouchers_value: Number(userData.meal_vouchers_value || 0),
        paid_leave_days: Number(userData.paid_leave_days || 0),
        total_compensation: userTotalComp,
        percentile,
        sample_size: similarProfiles.length,
      });

      // 2. GROSS SALARY DISTRIBUTION BY EXPERIENCE LEVEL
      const jobFamilyData = cityData.filter((d: any) => d.industry === userData.industry);
      
      const grossDist: SalaryDistribution[] = EXP_LEVELS.map(level => {
        const levelData = jobFamilyData.filter((d: any) => d.experience_level === level);
        if (levelData.length === 0) return null;

        const salaries = levelData.map((d: any) => Number(d.gross_salary));
        const quartiles = calculateQuartiles(salaries);
        const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;

        return {
          experience_level: level,
          ...quartiles,
          avg: Math.round(avg),
          count: levelData.length,
        };
      }).filter(Boolean) as SalaryDistribution[];

      setSalaryDistGross(grossDist);

      // 3. NET SALARY DISTRIBUTION BY EXPERIENCE LEVEL
      const netDist: SalaryDistribution[] = EXP_LEVELS.map(level => {
        const levelData = jobFamilyData.filter((d: any) => d.experience_level === level);
        if (levelData.length === 0) return null;

        const salaries = levelData.map((d: any) => Number(d.net_salary));
        const quartiles = calculateQuartiles(salaries);
        const avg = salaries.reduce((a, b) => a + b, 0) / salaries.length;

        return {
          experience_level: level,
          ...quartiles,
          avg: Math.round(avg),
          count: levelData.length,
        };
      }).filter(Boolean) as SalaryDistribution[];

      setSalaryDistNet(netDist);

      // 4. NET SALARY BY COMPANY SIZE
      const expLevelData = cityData.filter((d: any) => d.experience_level === userData.experience_level);
      
      const companySizes: CompanySizeSalary[] = COMPANY_SIZES.map(size => {
        const sizeData = expLevelData.filter((d: any) => d.company_size === size);
        if (sizeData.length === 0) return null;

        const avgNet = sizeData.reduce((sum: number, d: any) => sum + Number(d.net_salary), 0) / sizeData.length;

        return {
          company_size: size,
          avg_net_salary: Math.round(avgNet),
          count: sizeData.length,
        };
      }).filter(Boolean) as CompanySizeSalary[];

      setCompanySizeSalaries(companySizes);

      // 5. BENEFITS BREAKDOWN
      const benefitFilterData = cityData.filter((d: any) => 
        d.company_size === userData.company_size && 
        d.experience_level === userData.experience_level
      );

      if (benefitFilterData.length >= 5) {
        const mealCount = benefitFilterData.filter((d: any) => d.has_meal_vouchers).length;
        const healthCount = benefitFilterData.filter((d: any) => d.has_health_insurance).length;
        const lifeCount = benefitFilterData.filter((d: any) => d.has_life_insurance).length;
        
        const mealValues = benefitFilterData
          .filter((d: any) => d.has_meal_vouchers && d.meal_vouchers_value)
          .map((d: any) => Number(d.meal_vouchers_value));
        
        const avgMeal = mealValues.length > 0 
          ? mealValues.reduce((a, b) => a + b, 0) / mealValues.length 
          : 0;

        setBenefitStats({
          meal_vouchers_pct: Math.round((mealCount / benefitFilterData.length) * 100),
          avg_meal_value: Math.round(avgMeal),
          health_insurance_pct: Math.round((healthCount / benefitFilterData.length) * 100),
          life_insurance_pct: Math.round((lifeCount / benefitFilterData.length) * 100),
          sample_size: benefitFilterData.length,
        });
      }

      // 6. PAID LEAVE COMPARISON
      const leaveData = jobFamilyData.filter((d: any) => 
        d.experience_level === userData.experience_level && d.paid_leave_days
      );

      if (leaveData.length >= 5) {
        const leaveDays = leaveData.map((d: any) => Number(d.paid_leave_days)).sort((a, b) => a - b);
        const avgLeave = leaveDays.reduce((a, b) => a + b, 0) / leaveDays.length;
        const top10Index = Math.floor(leaveDays.length * 0.9);

        setPaidLeave({
          user_days: Number(userData.paid_leave_days || 0),
          avg_days: Math.round(avgLeave),
          top_10_pct_days: leaveDays[top10Index],
        });
      }

      // 7. WORK MODEL DISTRIBUTION
      const workModelData = cityData.filter((d: any) => d.experience_level === userData.experience_level);
      const workModelCount = workModelData.reduce((acc: any, d: any) => {
        acc[d.work_model] = (acc[d.work_model] || 0) + 1;
        return acc;
      }, {});

      const workModelDist = Object.entries(workModelCount).map(([model, count]) => ({
        name: model,
        value: count,
        percentage: Math.round(((count as number) / workModelData.length) * 100),
      }));

      setWorkModelDist(workModelDist);

      // 8. CONTRACT TYPE DISTRIBUTION
      const contractData = allData.filter((d: any) => 
        d.industry === userData.industry && d.experience_level === userData.experience_level
      );
      const contractCount = contractData.reduce((acc: any, d: any) => {
        acc[d.contract_type] = (acc[d.contract_type] || 0) + 1;
        return acc;
      }, {});

      const contractDist = Object.entries(contractCount).map(([type, count]) => ({
        name: type,
        value: count,
        percentage: Math.round(((count as number) / contractData.length) * 100),
      }));

      setContractTypeDist(contractDist);

      // 9. TENURE DATA
      const tenureByExp: TenureData[] = EXP_LEVELS.map(level => {
        const levelData = allData.filter((d: any) => d.experience_level === level && d.tenure_years);
        if (levelData.length === 0) return null;

        const avgTenure = levelData.reduce((sum: number, d: any) => sum + Number(d.tenure_years), 0) / levelData.length;

        return {
          experience_level: level,
          avg_tenure: Math.round(avgTenure * 10) / 10,
        };
      }).filter(Boolean) as TenureData[];

      setTenureData(tenureByExp);

    } catch (error) {
      console.error("Error fetching benchmarks:", error);
      toast({
        title: "Error",
        description: "Failed to load benchmark data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Please complete your compensation profile to view personalized benchmarks.
        </p>
      </Card>
    );
  }

  const getColorForValue = (userVal: number, avgVal: number, reverse = false) => {
    const diff = ((userVal - avgVal) / avgVal) * 100;
    if (reverse) {
      if (diff < -5) return COLORS.success;
      if (diff > 5) return COLORS.danger;
      return COLORS.warning;
    }
    if (diff > 5) return COLORS.success;
    if (diff < -5) return COLORS.danger;
    return COLORS.warning;
  };

  const minSalary = Math.min(...salaryDistGross.flatMap(d => [d.min]));
  const maxSalary = Math.max(...salaryDistGross.flatMap(d => [d.max]));
  const userPosition = ((userProfile.gross_salary - minSalary) / (maxSalary - minSalary)) * 100;

  return (
    <div className="space-y-8">
      {/* 1. HERO SUMMARY SECTION */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Your Compensation Profile</h2>
            <p className="text-base text-muted-foreground">
              {userProfile.job_title} • {userProfile.experience_level.charAt(0).toUpperCase() + userProfile.experience_level.slice(1)} Level • {userProfile.city}
            </p>
            <p className="text-sm text-muted-foreground">
              Company Size: {userProfile.company_size} employees
            </p>
          </div>

          <div className="bg-background/60 p-4 rounded-lg space-y-3">
            {/* Gross Salary */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-primary">
                  {userProfile.gross_salary.toLocaleString()} RON
                </span>
                <span className="text-base text-muted-foreground">/month gross salary</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Net salary: {userProfile.net_salary.toLocaleString()} RON/month
              </p>
            </div>

            {/* Benefits */}
            {(userProfile.has_meal_vouchers || userProfile.has_health_insurance || userProfile.has_life_insurance) && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm font-medium mb-1.5">Benefits:</p>
                <div className="flex flex-wrap gap-1.5">
                  {userProfile.has_meal_vouchers && (
                    <Badge variant="secondary" className="text-xs">
                      Meal Vouchers: {userProfile.meal_vouchers_value} RON/day
                    </Badge>
                  )}
                  {userProfile.has_health_insurance && (
                    <Badge variant="secondary" className="text-xs">
                      Health Insurance
                    </Badge>
                  )}
                  {userProfile.has_life_insurance && (
                    <Badge variant="secondary" className="text-xs">
                      Life Insurance
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Percentile */}
            <div className="pt-2 border-t border-border">
              <p className="text-base font-semibold mb-3">
                You're at the <span className="text-primary">{userProfile.percentile}th percentile</span> for {userProfile.job_title} in {userProfile.city}
              </p>
              
              <div className="space-y-1.5 mb-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Min: {minSalary.toLocaleString()} RON</span>
                  <span>Max: {maxSalary.toLocaleString()} RON</span>
                </div>
                <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute h-full bg-gradient-to-r from-danger via-warning to-success"
                    style={{ width: '100%' }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-background border-2 border-primary rounded-full shadow-lg"
                    style={{ left: `${userPosition}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
              </div>

              <Badge variant="outline" className="text-xs">
                Based on {userProfile.sample_size} professionals with similar profiles
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. SALARY ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Gross Salary Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Gross Salary by Experience Level in {userProfile.city}
          </h3>
          {salaryDistGross.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Not enough data for this comparison
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salaryDistGross}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="experience_level" 
                    tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString()} RON`}
                    labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
                  />
                  <Legend />
                  <Bar dataKey="min" fill={COLORS.muted} name="Min" />
                  <Bar dataKey="q1" fill={COLORS.info} name="25th %tile" />
                  <Bar dataKey="median" fill={COLORS.primary} name="Median" />
                  <Bar dataKey="q3" fill={COLORS.secondary} name="75th %tile" />
                  <Bar dataKey="max" fill={COLORS.accent} name="Max" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className="border-primary text-primary"
                >
                  Your Gross: {userProfile.gross_salary.toLocaleString()} RON ({userProfile.experience_level})
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Based on {salaryDistGross.reduce((sum, d) => sum + d.count, 0)} data points
              </p>
            </>
          )}
        </Card>

        {/* B. Net Salary by Company Size */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Net Salary by Company Size ({userProfile.experience_level})
          </h3>
          {companySizeSalaries.length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Limited data available
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={companySizeSalaries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="company_size" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()} RON`} />
                  <Bar 
                    dataKey="avg_net_salary" 
                    fill={COLORS.primary}
                    name="Avg Net Salary"
                    radius={[8, 8, 0, 0]}
                  >
                    {companySizeSalaries.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.company_size === userProfile.company_size ? COLORS.secondary : COLORS.primary}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {(() => {
                const userCompanyData = companySizeSalaries.find(c => c.company_size === userProfile.company_size);
                const maxCompanyData = companySizeSalaries.reduce((max, c) => 
                  c.avg_net_salary > max.avg_net_salary ? c : max
                );
                if (userCompanyData && maxCompanyData && userCompanyData.company_size !== maxCompanyData.company_size) {
                  const increase = ((maxCompanyData.avg_net_salary - userCompanyData.avg_net_salary) / userCompanyData.avg_net_salary) * 100;
                  return (
                    <div className="mt-4 p-3 bg-info/10 rounded-lg">
                      <p className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        Moving to {maxCompanyData.company_size} employees could increase net by {increase.toFixed(1)}%
                      </p>
                    </div>
                  );
                }
              })()}
              <p className="text-xs text-muted-foreground mt-2">
                Filtered by {userProfile.experience_level} level in {userProfile.city}
              </p>
            </>
          )}
        </Card>
      </div>

      {/* 3. BENEFITS BREAKDOWN */}
      {benefitStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6">
            Benefits Breakdown ({userProfile.city} • {userProfile.company_size} • {userProfile.experience_level})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Meal Vouchers */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-2xl">🍽️</span>
                <span>Meal Vouchers</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{benefitStats.meal_vouchers_pct}% have them</span>
                </div>
                <Progress value={benefitStats.meal_vouchers_pct} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Average: {benefitStats.avg_meal_value} RON/day
              </p>
              {userProfile.has_meal_vouchers ? (
                <div 
                  className="p-3 rounded-lg"
                  style={{ 
                    backgroundColor: getColorForValue(
                      userProfile.meal_vouchers_value, 
                      benefitStats.avg_meal_value
                    ) + '20'
                  }}
                >
                  <p className="text-sm font-medium flex items-center gap-2">
                    <span>✅ Your value: {userProfile.meal_vouchers_value} RON/day</span>
                  </p>
                  {userProfile.meal_vouchers_value > benefitStats.avg_meal_value && (
                    <p className="text-xs text-success mt-1">Above average!</p>
                  )}
                  {userProfile.meal_vouchers_value < benefitStats.avg_meal_value && (
                    <p className="text-xs text-danger mt-1">Below average</p>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-danger/10">
                  <p className="text-sm font-medium">❌ You don't have it</p>
                </div>
              )}
            </div>

            {/* Health Insurance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-2xl">🏥</span>
                <span>Health Insurance</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{benefitStats.health_insurance_pct}% have it</span>
                </div>
                <Progress value={benefitStats.health_insurance_pct} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Private health coverage
              </p>
              {userProfile.has_health_insurance ? (
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-sm font-medium text-success">✅ You have it</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-danger/10">
                  <p className="text-sm font-medium text-danger">❌ You don't have it</p>
                </div>
              )}
            </div>

            {/* Life Insurance */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-2xl">🛡️</span>
                <span>Life Insurance</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{benefitStats.life_insurance_pct}% have it</span>
                </div>
                <Progress value={benefitStats.life_insurance_pct} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                Life insurance coverage
              </p>
              {userProfile.has_life_insurance ? (
                <div className="p-3 rounded-lg bg-success/10">
                  <p className="text-sm font-medium text-success">✅ You have it</p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-danger/10">
                  <p className="text-sm font-medium text-danger">❌ You don't have it</p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Based on {benefitStats.sample_size} similar professionals
          </p>
        </Card>
      )}

      {/* 4. PAID LEAVE COMPARISON */}
      {paidLeave && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Annual Paid Leave Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart 
              data={[
                { name: 'Your Days', value: paidLeave.user_days },
                { name: 'Average', value: paidLeave.avg_days },
                { name: 'Top 10%', value: paidLeave.top_10_pct_days },
              ]}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value: number) => `${value} days`} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {[0, 1, 2].map((index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? COLORS.secondary : index === 1 ? COLORS.primary : COLORS.accent} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm flex items-center gap-2">
              {paidLeave.user_days > paidLeave.avg_days ? (
                <>
                  <TrendingUp className="h-4 w-4 text-success" />
                  You're {paidLeave.user_days - paidLeave.avg_days} days above average for your seniority
                </>
              ) : paidLeave.user_days < paidLeave.avg_days ? (
                <>
                  <TrendingDown className="h-4 w-4 text-danger" />
                  You're {paidLeave.avg_days - paidLeave.user_days} days below average for your seniority
                </>
              ) : (
                <>You're at the average for your seniority level</>
              )}
            </p>
          </div>
        </Card>
      )}

      {/* 5. WORK MODEL & CONTRACT TYPE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Model Distribution */}
        {workModelDist.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Work Model Distribution ({userProfile.experience_level})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={workModelDist}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  outerRadius={90}
                  fill={COLORS.primary}
                  dataKey="value"
                >
                  {workModelDist.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === userProfile.work_model ? COLORS.secondary : Object.values(COLORS)[index % 7]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => 
                  [`${value} professionals (${props.payload.percentage}%)`, props.payload.name]
                } />
              </PieChart>
            </ResponsiveContainer>
            <Badge variant="outline" className="mt-2">
              Your model: {userProfile.work_model}
            </Badge>
          </Card>
        )}

        {/* Contract Type Distribution */}
        {contractTypeDist.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Contract Type Distribution ({userProfile.industry})
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={contractTypeDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.percentage}%`}
                  fill={COLORS.primary}
                  dataKey="value"
                >
                  {contractTypeDist.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === userProfile.contract_type ? COLORS.accent : Object.values(COLORS)[index % 7]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string, props: any) => 
                  [`${value} professionals (${props.payload.percentage}%)`, props.payload.name]
                } />
              </PieChart>
            </ResponsiveContainer>
            <Badge variant="outline" className="mt-2">
              Your contract: {userProfile.contract_type}
            </Badge>
          </Card>
        )}
      </div>

      {/* 6. TENURE INSIGHT */}
      {tenureData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Average Tenure by Experience Level</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={tenureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
              <XAxis 
                dataKey="experience_level" 
                tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
              />
              <YAxis label={{ value: 'Years', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => `${value} years`}
                labelFormatter={(label) => label.charAt(0).toUpperCase() + label.slice(1)}
              />
              <Line 
                type="monotone" 
                dataKey="avg_tenure" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                dot={{ fill: COLORS.primary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {(() => {
            const userExpData = tenureData.find(d => d.experience_level === userProfile.experience_level);
            if (userExpData) {
              return (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">
                    {userProfile.experience_level.charAt(0).toUpperCase() + userProfile.experience_level.slice(1)} professionals 
                    typically stay <strong>{userExpData.avg_tenure} years</strong>. 
                    You: <strong>{userProfile.tenure_years} years</strong>
                  </p>
                </div>
              );
            }
          })()}
        </Card>
      )}

      {/* 7. PRO UPGRADE */}
      <Card className="p-8 bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-dashed">
        <div className="flex items-start gap-4">
          <Lock className="h-8 w-8 text-muted-foreground mt-1" />
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-3">
              <h3 className="text-2xl font-bold">🔒 Unlock Pro</h3>
              <span className="text-lg font-semibold text-primary">€9.99/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Access to Romania data</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">✓</span>
                <span>All Freemium features</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">✓</span>
                <span>Full Romania database access</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">✓</span>
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">✓</span>
                <span>Export reports</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <span className="text-primary">✓</span>
                <span>Priority support</span>
              </li>
            </ul>
            <Button size="lg" className="w-full md:w-auto" asChild>
              <a href="/pricing">Start Pro Trial</a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
