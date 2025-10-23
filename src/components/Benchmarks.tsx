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
  ComposedChart,
  Scatter,
  ReferenceLine,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface CityDistribution {
  city: string;
  count: number;
  percentage: number;
}

interface SalaryRange {
  experience_level: string;
  min_gross: number;
  max_gross: number;
  avg_gross: number;
  min_net: number;
  max_net: number;
  avg_net: number;
  count: number;
}

interface BenefitsStats {
  meal_vouchers_percentage: number;
  avg_meal_voucher_value: number;
  health_insurance_percentage: number;
  life_insurance_percentage: number;
  total_count: number;
}

interface UserData {
  gross_salary: number;
  net_salary: number;
  experience_level: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#8b5cf6', '#ec4899', '#f59e0b'];

export const Benchmarks = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [cityDistribution, setCityDistribution] = useState<CityDistribution[]>([]);
  const [salaryRanges, setSalaryRanges] = useState<SalaryRange[]>([]);
  const [benefitsStats, setBenefitsStats] = useState<BenefitsStats | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userCity, setUserCity] = useState<string>("Iași");

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get user's city
      const { data: profile } = await supabase
        .from("profiles")
        .select("city")
        .eq("user_id", user?.id)
        .maybeSingle();

      const city = profile?.city || "Iași";
      setUserCity(city);

      // Fetch all compensation data
      const { data: allData, error: allError } = await supabase
        .from("compensation_data")
        .select("*");

      if (allError) throw allError;

      // 1. City Distribution (Pie Chart)
      const cityCount = allData?.reduce((acc: any, row: any) => {
        acc[row.city] = (acc[row.city] || 0) + 1;
        return acc;
      }, {});

      const totalSubmissions = allData?.length || 0;
      const cityDist: CityDistribution[] = Object.entries(cityCount || {}).map(([city, count]) => ({
        city,
        count: count as number,
        percentage: Math.round(((count as number) / totalSubmissions) * 100),
      }));
      setCityDistribution(cityDist);

      // 2. Salary Ranges by Experience Level (for user's city)
      const cityData = allData?.filter(row => row.city === city) || [];
      
      const expLevels = ['junior', 'mid', 'senior', 'lead'];
      const ranges: SalaryRange[] = expLevels.map(level => {
        const levelData = cityData.filter(row => row.experience_level === level);
        if (levelData.length === 0) {
          return {
            experience_level: level,
            min_gross: 0,
            max_gross: 0,
            avg_gross: 0,
            min_net: 0,
            max_net: 0,
            avg_net: 0,
            count: 0,
          };
        }

        const grossSalaries = levelData.map(d => Number(d.gross_salary));
        const netSalaries = levelData.map(d => Number(d.net_salary));

        return {
          experience_level: level,
          min_gross: Math.min(...grossSalaries),
          max_gross: Math.max(...grossSalaries),
          avg_gross: Math.round(grossSalaries.reduce((a, b) => a + b, 0) / grossSalaries.length),
          min_net: Math.min(...netSalaries),
          max_net: Math.max(...netSalaries),
          avg_net: Math.round(netSalaries.reduce((a, b) => a + b, 0) / netSalaries.length),
          count: levelData.length,
        };
      }).filter(r => r.count > 0);

      setSalaryRanges(ranges);

      // 3. Benefits Stats for Iași
      const iasiData = allData?.filter(row => row.city === "Iași") || [];
      if (iasiData.length > 0) {
        const mealVouchersCount = iasiData.filter(d => d.has_meal_vouchers).length;
        const healthInsCount = iasiData.filter(d => d.has_health_insurance).length;
        const lifeInsCount = iasiData.filter(d => d.has_life_insurance).length;
        
        const mealVoucherValues = iasiData
          .filter(d => d.has_meal_vouchers && d.meal_vouchers_value)
          .map(d => Number(d.meal_vouchers_value));
        
        const avgMealVoucher = mealVoucherValues.length > 0
          ? Math.round(mealVoucherValues.reduce((a, b) => a + b, 0) / mealVoucherValues.length)
          : 0;

        setBenefitsStats({
          meal_vouchers_percentage: Math.round((mealVouchersCount / iasiData.length) * 100),
          avg_meal_voucher_value: avgMealVoucher,
          health_insurance_percentage: Math.round((healthInsCount / iasiData.length) * 100),
          life_insurance_percentage: Math.round((lifeInsCount / iasiData.length) * 100),
          total_count: iasiData.length,
        });
      }

      // 4. Get user's own compensation data (if exists)
      if (user) {
        const { data: userCompData } = await supabase
          .from("compensation_data")
          .select("gross_salary, net_salary, experience_level")
          .eq("anonymous_id", user.id)
          .maybeSingle();

        if (userCompData) {
          setUserData({
            gross_salary: Number(userCompData.gross_salary),
            net_salary: Number(userCompData.net_salary),
            experience_level: userCompData.experience_level,
          });
        }
      }
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
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const renderCustomLabel = (entry: any) => {
    return `${entry.city}: ${entry.percentage}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Salary Benchmarks</h2>
        <p className="text-muted-foreground">
          Compare your compensation with market data {userCity !== "Iași" ? `in ${userCity}` : "in your city"}
        </p>
      </div>

      {/* City Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Submissions by City</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={cityDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="count"
            >
              {cityDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number, name: string, props: any) => [`${value} submissions (${props.payload.percentage}%)`, props.payload.city]} />
          </PieChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Total submissions: {cityDistribution.reduce((sum, item) => sum + item.count, 0)}
        </p>
      </Card>

      {/* Gross Salary Range */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Gross Salary Range by Seniority ({userCity})</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={salaryRanges}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="experience_level" 
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} RON`}
              labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)}`}
            />
            <Legend />
            <Bar dataKey="min_gross" fill="hsl(var(--muted))" name="Min" />
            <Bar dataKey="avg_gross" fill="hsl(var(--primary))" name="Average" />
            <Bar dataKey="max_gross" fill="hsl(var(--secondary))" name="Max" />
            {userData && (
              <Scatter 
                dataKey={(entry) => entry.experience_level === userData.experience_level ? userData.gross_salary : null}
                fill="#ef4444" 
                name="Your Salary"
                shape="star"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {userData && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-red-500 border-red-500">
              Your Position: {userData.gross_salary.toLocaleString()} RON ({userData.experience_level})
            </Badge>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Shows minimum, average, and maximum gross salaries for each experience level in {userCity}
        </p>
      </Card>

      {/* Net Salary Range */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Net Salary Range by Seniority ({userCity})</h3>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={salaryRanges}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="experience_level" 
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} RON`}
              labelFormatter={(label) => `${label.charAt(0).toUpperCase() + label.slice(1)}`}
            />
            <Legend />
            <Bar dataKey="min_net" fill="hsl(var(--muted))" name="Min" />
            <Bar dataKey="avg_net" fill="hsl(var(--primary))" name="Average" />
            <Bar dataKey="max_net" fill="hsl(var(--secondary))" name="Max" />
            {userData && (
              <Scatter 
                dataKey={(entry) => entry.experience_level === userData.experience_level ? userData.net_salary : null}
                fill="#ef4444" 
                name="Your Salary"
                shape="star"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        {userData && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="text-red-500 border-red-500">
              Your Position: {userData.net_salary.toLocaleString()} RON ({userData.experience_level})
            </Badge>
          </div>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Shows minimum, average, and maximum net salaries for each experience level in {userCity}
        </p>
      </Card>

      {/* Seniority Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Salary Progression by Seniority Level ({userCity})</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={salaryRanges}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="experience_level" 
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} RON`}
            />
            <Legend />
            <Bar dataKey="avg_gross" fill="hsl(var(--primary))" name="Avg Gross Salary" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {salaryRanges.map((range, index) => {
            if (index === 0) return null;
            const prevRange = salaryRanges[index - 1];
            const diff = range.avg_gross - prevRange.avg_gross;
            const percentIncrease = Math.round((diff / prevRange.avg_gross) * 100);
            return (
              <p key={range.experience_level} className="text-sm text-muted-foreground">
                <span className="font-semibold capitalize">{prevRange.experience_level}</span> to{" "}
                <span className="font-semibold capitalize">{range.experience_level}</span>:{" "}
                +{diff.toLocaleString()} RON ({percentIncrease}% increase)
              </p>
            );
          })}
        </div>
      </Card>

      {/* Benefits Stats for Iași */}
      {benefitsStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Benefits Breakdown (Iași)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Meal Vouchers</h4>
              <p className="text-3xl font-bold">{benefitsStats.meal_vouchers_percentage}%</p>
              <p className="text-sm text-muted-foreground">
                Avg: {benefitsStats.avg_meal_voucher_value} RON/day
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Private Health Insurance</h4>
              <p className="text-3xl font-bold">{benefitsStats.health_insurance_percentage}%</p>
              <p className="text-sm text-muted-foreground">of employees</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Life Insurance</h4>
              <p className="text-3xl font-bold">{benefitsStats.life_insurance_percentage}%</p>
              <p className="text-sm text-muted-foreground">of employees</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Based on {benefitsStats.total_count} submissions from Iași
          </p>
        </Card>
      )}
    </div>
  );
};
