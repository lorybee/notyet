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
  LineChart,
  Line,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface BenchmarkData {
  experience_level: string;
  company_size: string;
  avg_gross_salary: number;
  avg_net_salary: number;
  avg_benefits: number;
  count: number;
}

export const Benchmarks = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([]);
  const [cityData, setCityData] = useState<any[]>([]);

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      // Get current user's city from profile (for freemium filtering)
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("city")
        .eq("user_id", user?.id)
        .single();

      const userCity = profile?.city || "Iași"; // Default to Iași for demo

      // Fetch and aggregate compensation data by experience level
      const { data: expData, error: expError } = await supabase
        .from("compensation_data")
        .select("*")
        .eq("city", userCity);

      if (expError) throw expError;

      // Aggregate by experience level
      const aggregated = expData?.reduce((acc: any, row: any) => {
        const key = `${row.experience_level}-${row.company_size}`;
        if (!acc[key]) {
          acc[key] = {
            experience_level: row.experience_level,
            company_size: row.company_size,
            total_gross: 0,
            total_net: 0,
            total_benefits: 0,
            count: 0,
          };
        }
        acc[key].total_gross += parseFloat(row.gross_salary);
        acc[key].total_net += parseFloat(row.net_salary);
        const benefitsValue = row.has_meal_vouchers ? (parseFloat(row.meal_vouchers_value) * 22) : 0;
        acc[key].total_benefits += benefitsValue;
        acc[key].count += 1;
        return acc;
      }, {});

      const benchmarks = Object.values(aggregated || {}).map((item: any) => ({
        experience_level: item.experience_level,
        company_size: item.company_size,
        avg_gross_salary: Math.round(item.total_gross / item.count),
        avg_net_salary: Math.round(item.total_net / item.count),
        avg_benefits: Math.round(item.total_benefits / item.count),
        count: item.count,
      }));

      setBenchmarkData(benchmarks as BenchmarkData[]);

      // Aggregate by city for comparison
      const { data: allCities, error: cityError } = await supabase
        .from("compensation_data")
        .select("city, gross_salary");

      if (cityError) throw cityError;

      const cityAgg = allCities?.reduce((acc: any, row: any) => {
        if (!acc[row.city]) {
          acc[row.city] = { city: row.city, total: 0, count: 0 };
        }
        acc[row.city].total += parseFloat(row.gross_salary);
        acc[row.city].count += 1;
        return acc;
      }, {});

      const cityStats = Object.values(cityAgg || {}).map((item: any) => ({
        city: item.city,
        avg_salary: Math.round(item.total / item.count),
      }));

      setCityData(cityStats);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Salary Benchmarks</h2>
        <p className="text-muted-foreground">
          Compare your compensation with market data in your city
        </p>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Average Salary by Experience Level</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="experience_level" 
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString()} RON`}
              labelFormatter={(label) => `Experience: ${label}`}
            />
            <Legend />
            <Bar dataKey="avg_gross_salary" fill="hsl(var(--primary))" name="Gross Salary" />
            <Bar dataKey="avg_net_salary" fill="hsl(var(--secondary))" name="Net Salary" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4">
          Based on {benchmarkData.reduce((sum, item) => sum + item.count, 0)} submissions in your city
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Salary Comparison Across Cities</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={cityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="city" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toLocaleString()} RON`} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="avg_salary" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Average Gross Salary"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Benefits Breakdown</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="experience_level"
              tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
            <YAxis />
            <Tooltip formatter={(value: number) => `${value.toLocaleString()} RON`} />
            <Legend />
            <Bar dataKey="avg_benefits" fill="hsl(var(--accent))" name="Monthly Benefits Value" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4">
          Average monthly value of meal vouchers and other benefits
        </p>
      </Card>
    </div>
  );
};
