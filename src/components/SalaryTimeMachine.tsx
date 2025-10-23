import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Calendar, ArrowLeftRight } from "lucide-react";

// Romanian inflation rates (approximate annual rates)
const inflationRates = {
  "2020-2021": 3.9,
  "2021-2022": 13.8,
  "2022-2023": 10.4,
  "2023-2024": 5.5,
  "2024-2025": 4.5, // estimated
};

const SalaryTimeMachine = () => {
  const [salary, setSalary] = useState<string>("");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [result, setResult] = useState<{
    original: number;
    adjusted: number;
    difference: number;
    percentChange: number;
    breakdown: { year: string; rate: number; value: number }[];
  } | null>(null);

  const calculateInflation = () => {
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum) || salaryNum <= 0) return;

    let adjustedSalary = salaryNum;
    const breakdown: { year: string; rate: number; value: number }[] = [];

    if (direction === "forward") {
      // 2020 → 2025: Apply inflation
      Object.entries(inflationRates).forEach(([period, rate]) => {
        adjustedSalary = adjustedSalary * (1 + rate / 100);
        breakdown.push({
          year: period,
          rate: rate,
          value: Math.round(adjustedSalary),
        });
      });
    } else {
      // 2025 → 2020: Remove inflation (deflate)
      Object.entries(inflationRates)
        .reverse()
        .forEach(([period, rate]) => {
          adjustedSalary = adjustedSalary / (1 + rate / 100);
          breakdown.push({
            year: period.split("-").reverse().join("-"),
            rate: rate,
            value: Math.round(adjustedSalary),
          });
        });
    }

    const difference = adjustedSalary - salaryNum;
    const percentChange = ((adjustedSalary - salaryNum) / salaryNum) * 100;

    setResult({
      original: salaryNum,
      adjusted: Math.round(adjustedSalary),
      difference: Math.round(difference),
      percentChange: Math.round(percentChange * 10) / 10,
      breakdown,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Salary Time Machine
        </CardTitle>
        <CardDescription>
          Compare purchasing power between Oct 2020 and Oct 2025 using Romanian inflation data (~43% cumulative)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Compact Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="salary" className="text-sm">
              {direction === "forward" ? "Oct 2020 Salary (RON)" : "Oct 2025 Salary (RON)"}
            </Label>
            <Input
              id="salary"
              type="number"
              placeholder="e.g., 5000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              min="0"
              step="100"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Direction</Label>
            <Button
              variant="outline"
              className="w-full h-11 justify-between"
              onClick={() => setDirection(direction === "forward" ? "backward" : "forward")}
            >
              <span className="text-sm">{direction === "forward" ? "2020 → 2025" : "2025 → 2020"}</span>
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button onClick={calculateInflation} className="w-full" disabled={!salary || parseFloat(salary) <= 0}>
          Calculate Purchasing Power
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-3 border-t">
            {/* Compact Result Display */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 border">
                <div className="text-xs text-muted-foreground mb-1">
                  {direction === "forward" ? "Oct 2020" : "Oct 2025"}
                </div>
                <div className="text-xl font-bold">{result.original.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">RON</div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border-primary/20">
                <div className="text-xs text-muted-foreground mb-1">
                  {direction === "forward" ? "Oct 2025" : "Oct 2020"}
                </div>
                <div className="text-xl font-bold">{result.adjusted.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">RON equivalent</div>
              </div>
            </div>

            {/* Impact Summary */}
            <div className={`p-3 rounded-lg ${result.difference > 0 ? "bg-destructive/10" : "bg-green-500/10"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {direction === "forward" ? (
                    <TrendingUp className="h-4 w-4 text-destructive" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  )}
                  <div>
                    <div className="text-sm font-semibold">
                      {direction === "forward" ? `+${Math.abs(result.percentChange)}%` : `-${Math.abs(result.percentChange)}%`}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {direction === "forward" ? "inflation impact" : "purchasing power"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {result.difference > 0 ? "+" : ""}{result.difference.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">RON</div>
                </div>
              </div>
            </div>

            {/* Compact Breakdown */}
            <details className="group">
              <summary className="cursor-pointer p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors list-none">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Year-by-Year Breakdown</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </div>
              </summary>
              <div className="mt-2 space-y-1.5">
                {result.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 bg-muted/20 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      <div>
                        <span className="font-medium">{item.year}</span>
                        <span className="text-muted-foreground ml-2">+{item.rate}%</span>
                      </div>
                    </div>
                    <div className="font-semibold">{item.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </details>

            {/* Explanation */}
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {direction === "forward" ? (
                  <>
                    <strong>{result.original.toLocaleString()} RON</strong> in Oct 2020 needs to be{" "}
                    <strong>{result.adjusted.toLocaleString()} RON</strong> in Oct 2025 to maintain the same purchasing power
                    ({Math.abs(result.percentChange)}% increase to keep up with inflation).
                  </>
                ) : (
                  <>
                    <strong>{result.original.toLocaleString()} RON</strong> in Oct 2025 had the purchasing power of{" "}
                    <strong>{result.adjusted.toLocaleString()} RON</strong> in Oct 2020
                    (money could buy {Math.abs(result.percentChange)}% more back then).
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Data Source Footer */}
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Data:</strong> Romanian INS inflation • 2020-21 (3.9%), 2021-22 (13.8%), 2022-23 (10.4%), 2023-24 (5.5%), 2024-25 (4.5% est.)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryTimeMachine;
