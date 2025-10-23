import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TotalRewardsForm } from "@/components/TotalRewardsForm";
import { Benchmarks } from "@/components/Benchmarks";
import MarketAnalysis from "@/components/MarketAnalysis";
import LabourLawChat from "@/components/LabourLawChat";
import SalaryTimeMachine from "@/components/SalaryTimeMachine";
import { 
  BarChart3, 
  User, 
  FileText, 
  TrendingUp, 
  Lightbulb, 
  MessageSquare, 
  Calculator,
  LogOut
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto animate-pulse">
            <BarChart3 className="h-7 w-7 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BenchRight</h1>
                <p className="text-xs text-muted-foreground">Clear Pay+</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">Freemium Plan</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-none">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome to BenchRight! 👋
            </h2>
            <p className="text-muted-foreground">
              You're on the Freemium plan with access to city-level compensation data. 
              Start by filling out your Total Rewards information to see how you compare.
            </p>
          </Card>

          {/* Dashboard Tabs */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-2 h-auto bg-muted/50 p-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Total Rewards</span>
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Benchmarks</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="law" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Labour Law</span>
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden sm:inline">Time Machine</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Profile Settings</h3>
                <p className="text-muted-foreground mb-4">
                  Set your default city and industry to prefill forms.
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Profile management coming soon. For now, you can use the Total Rewards tab 
                      to enter your compensation data.
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="mt-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Total Rewards Calculator</h2>
                  <p className="text-muted-foreground">
                    Submit your compensation data anonymously to contribute to market insights and access personalized benchmarks.
                  </p>
                </div>
                <TotalRewardsForm />
              </div>
            </TabsContent>

            <TabsContent value="benchmarks" className="mt-6">
              <Benchmarks />
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <MarketAnalysis />
            </TabsContent>

            <TabsContent value="law" className="mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    ⚠️ <strong>Disclaimer:</strong> This information is for educational purposes only 
                    and does not constitute legal advice. For specific legal matters, consult a qualified attorney.
                  </p>
                </div>
                <LabourLawChat />
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="mt-6">
              <SalaryTimeMachine />
            </TabsContent>
          </Tabs>

          {/* Privacy Notice */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-muted-foreground text-center">
              🔒 <strong>Privacy Notice:</strong> Anonymous by design. Open algorithms. RLS secured. 
              EU data residency (Frankfurt). Your compensation data is never linked to your account.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
