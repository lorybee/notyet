import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp } from "lucide-react";

const MarketAnalysis = () => {
  const [analysis, setAnalysis] = useState<string>("");
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

      setAnalysis(data.analysis);
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

      {analysis && (
        <Card className="p-6">
          <div 
            className="prose prose-sm max-w-none dark:prose-invert
              prose-headings:text-foreground prose-headings:font-bold
              prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-strong:text-foreground prose-strong:font-semibold
              prose-ul:text-muted-foreground prose-ul:my-3
              prose-li:my-1"
          >
            <div 
              dangerouslySetInnerHTML={{ 
                __html: analysis
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^- (.*$)/gim, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
                  .replace(/\n\n/g, '</p><p>')
                  .replace(/^(?!<[hul])/gm, '<p>')
                  .replace(/(?<![hul]>)$/gm, '</p>')
              }}
            />
          </div>
        </Card>
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
