import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, TrendingUp, TrendingDown, Calendar } from "lucide-react";

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Salary Time Machine
          </CardTitle>
          <CardDescription>
            Compare purchasing power between October 2020 and October 2025 using Romanian inflation data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Direction Selection */}
          <div className="space-y-3">
            <Label>Calculation Direction</Label>
            <RadioGroup value={direction} onValueChange={(v) => setDirection(v as "forward" | "backward")}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="forward" id="forward" />
                <Label htmlFor="forward" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">2020 → 2025</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      What a 2020 salary is worth in 2025
                    </span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="backward" id="backward" />
                <Label htmlFor="backward" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">2025 → 2020</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      What a 2025 salary would be worth in 2020
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Salary Input */}
          <div className="space-y-2">
            <Label htmlFor="salary">
              {direction === "forward" ? "October 2020 Salary (RON)" : "October 2025 Salary (RON)"}
            </Label>
            <Input
              id="salary"
              type="number"
              placeholder="e.g., 5000"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              min="0"
              step="100"
            />
          </div>

          <Button onClick={calculateInflation} className="w-full" disabled={!salary || parseFloat(salary) <= 0}>
            Calculate Purchasing Power
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {direction === "forward" ? "October 2020" : "October 2025"}
                    </div>
                    <div className="text-2xl font-bold">{result.original.toLocaleString()} RON</div>
                  </CardContent>
                </Card>
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground mb-1">
                      {direction === "forward" ? "October 2025 Equivalent" : "October 2020 Equivalent"}
                    </div>
                    <div className="text-2xl font-bold">{result.adjusted.toLocaleString()} RON</div>
                  </CardContent>
                </Card>
              </div>

              {/* Impact Card */}
              <Card className={result.difference > 0 ? "bg-destructive/10 border-destructive/20" : "bg-green-500/10 border-green-500/20"}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Purchasing Power Change</div>
                      <div className="text-xl font-bold flex items-center gap-2">
                        {direction === "forward" ? (
                          <>
                            <TrendingUp className="h-5 w-5 text-destructive" />
                            <span>Need {Math.abs(result.percentChange)}% more</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-5 w-5 text-green-600" />
                            <span>Had {Math.abs(result.percentChange)}% more power</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Difference</div>
                      <div className="text-lg font-semibold">
                        {result.difference > 0 ? "+" : ""}
                        {result.difference.toLocaleString()} RON
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Year-by-Year Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.breakdown.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{item.year}</div>
                            <div className="text-sm text-muted-foreground">
                              Inflation: {item.rate}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{item.value.toLocaleString()} RON</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Explanation */}
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>What this means:</strong> {direction === "forward" ? (
                      <>
                        A salary of {result.original.toLocaleString()} RON in October 2020 needs to be{" "}
                        {result.adjusted.toLocaleString()} RON in October 2025 to maintain the same purchasing power.
                        This represents a {Math.abs(result.percentChange)}% increase needed to keep up with inflation.
                      </>
                    ) : (
                      <>
                        A salary of {result.original.toLocaleString()} RON in October 2025 had the purchasing power
                        equivalent to {result.adjusted.toLocaleString()} RON in October 2020. Your money could buy
                        {Math.abs(result.percentChange)}% more back then.
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Source */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <p className="text-sm text-center">
            <span className="font-semibold">Data Source:</span> Romanian National Institute of Statistics (INS) inflation data
            {' • '}
            <span className="text-muted-foreground">
              Cumulative inflation rate: ~43% (Oct 2020 - Oct 2025)
            </span>
          </p>
          <p className="text-xs text-muted-foreground text-center mt-2">
            📊 Historical rates used: 2020-21 (3.9%), 2021-22 (13.8%), 2022-23 (10.4%), 2023-24 (5.5%), 2024-25 (4.5% est.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryTimeMachine;
