import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, ArrowUpRight, ArrowDownRight, Target, Lightbulb, MessageSquare } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface AnalysisData {
  percentile: number;
  percentileText: string;
  vsMarketAverage: number;
  marketAverageGross: number;
  top10Gross: number;
  strengths: string[];
  opportunities: string[];
  careerMoves: Array<{
    title: string;
    impact: string;
    actions: string[];
  }>;
  marketInsights: string[];
  talkingPoints: string[];
}

interface UserData {
  grossSalary: number;
  netSalary: number;
  jobTitle: string;
  city: string;
}

const MarketAnalysis = () => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [dataPoints, setDataPoints] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-analysis');

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.needsData) {
        toast({
          title: "Complete Your Profile",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data.analysis);
      setUserData(data.userData);
      setDataPoints(data.dataPoints || 0);
      toast({
        title: "Analysis Complete",
        description: "Your personalized market analysis is ready",
      });
    } catch (error) {
      console.error('Error generating analysis:', error);
      toast({
        title: "Error",
        description: "Failed to generate analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatSalary = (amount: number) => {
    return new Intl.NumberFormat('ro-RO').format(amount);
  };

  const takeHomePercentage = userData 
    ? ((userData.netSalary / userData.grossSalary) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Personalized Market Analysis</h2>
          <p className="text-muted-foreground">
            AI-powered insights comparing your compensation to market benchmarks
          </p>
        </div>
        <Button 
          onClick={generateAnalysis} 
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Generate Analysis
            </>
          )}
        </Button>
      </div>

      {analysis && userData && (
        <div className="space-y-6 animate-fade-in">
          {/* 1. HERO INSIGHT CARD */}
          <Card className={`p-6 ${analysis.percentile >= 50 ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900'}`}>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-3xl font-bold mb-2">
                    You're in the {analysis.percentile}th Percentile
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {analysis.percentileText}
                  </p>
                </div>
                <Badge 
                  variant={analysis.vsMarketAverage > 0 ? "default" : "secondary"}
                  className="text-lg px-4 py-2"
                >
                  {analysis.vsMarketAverage > 0 ? '+' : ''}{analysis.vsMarketAverage}% vs market
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Market Position</span>
                  <span className="font-semibold">{analysis.percentile}th percentile</span>
                </div>
                <div className="relative">
                  <Progress value={analysis.percentile} className="h-3" />
                  <div 
                    className="absolute top-0 h-3 flex items-center" 
                    style={{ left: `${analysis.percentile}%` }}
                  >
                    <div className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full -translate-x-1/2 -translate-y-6 whitespace-nowrap font-semibold">
                      YOU
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. SALARY SNAPSHOT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Salary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Gross</p>
                  <p className="text-2xl font-bold">{formatSalary(userData.grossSalary)} RON</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net</p>
                  <p className="text-xl font-semibold">{formatSalary(userData.netSalary)} RON</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Take-home</p>
                  <p className="text-lg">{takeHomePercentage}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Market Average</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Gross</p>
                  <p className="text-2xl font-bold">{formatSalary(analysis.marketAverageGross)} RON</p>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {analysis.vsMarketAverage > 0 ? (
                    <>
                      <ArrowUpRight className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        +{formatSalary(userData.grossSalary - analysis.marketAverageGross)} RON
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-semibold">
                        {formatSalary(userData.grossSalary - analysis.marketAverageGross)} RON
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top 10%</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Gross</p>
                  <p className="text-2xl font-bold">{formatSalary(analysis.top10Gross)} RON</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Growth potential</p>
                  <p className="text-lg font-semibold text-primary">
                    +{formatSalary(analysis.top10Gross - userData.grossSalary)} RON
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 3. YOUR POSITION SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>💪</span> Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✅</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" /> Growth Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.opportunities.map((opportunity, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-yellow-600 mt-1">⚠️</span>
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* 4. TOP CAREER MOVES */}
          <Card>
            <CardHeader>
              <CardTitle>Top 3 Career Moves</CardTitle>
              <CardDescription>Actionable recommendations to boost your compensation</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {analysis.careerMoves.map((move, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-2xl">
                          {idx === 0 ? '💼' : idx === 1 ? '🚀' : '📈'}
                        </span>
                        <div>
                          <p className="font-semibold">{move.title}</p>
                          <p className="text-sm text-muted-foreground">Impact: {move.impact}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-11 space-y-2">
                        <p className="font-medium text-sm">Key actions:</p>
                        <ul className="space-y-1">
                          {move.actions.map((action, actionIdx) => (
                            <li key={actionIdx} className="text-sm flex items-start gap-2">
                              <span className="text-primary">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* 5. NEGOTIATION TALKING POINTS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Negotiation Talking Points
              </CardTitle>
              <CardDescription>Data-driven points to use in salary discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {analysis.talkingPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="font-bold text-primary">{idx + 1}.</span>
                    <span className="text-sm">{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 6. MARKET CONTEXT */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Quick Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.marketInsights.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 7. DATA NOTE */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <p className="text-sm text-center">
                <span className="font-semibold">Data Source:</span> Based on {dataPoints} professionals in {userData.city}
                {' • '}
                <span className="text-muted-foreground">
                  Analysis generated {new Date().toLocaleDateString('ro-RO')}
                </span>
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                💡 This analysis uses real compensation data submitted by users in your city
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {!analysis && !isLoading && (
        <Card className="p-8 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Get Your Market Analysis</h3>
          <p className="text-muted-foreground mb-4">
            Click "Generate Analysis" to get personalized insights about your compensation
            compared to market benchmarks, career growth recommendations, and more.
          </p>
        </Card>
      )}
    </div>
  );
};

export default MarketAnalysis;
