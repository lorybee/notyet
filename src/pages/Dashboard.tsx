import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import benchrightLogo from "@/assets/benchright-logo.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { TotalRewardsForm } from "@/components/TotalRewardsForm";
import { Benchmarks } from "@/components/Benchmarks";
import MarketAnalysis from "@/components/MarketAnalysis";
import LabourLawChat from "@/components/LabourLawChat";
import SalaryTimeMachine from "@/components/SalaryTimeMachine";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { Footer } from "@/components/Footer";
import { 
  BarChart3, 
  User, 
  FileText, 
  TrendingUp, 
  Lightbulb, 
  MessageSquare, 
  Calculator,
  LogOut,
  ShieldCheck,
  Lock,
  Server,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check authentication status and fetch profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        
        // Fetch user profile for display name
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (profile?.display_name) {
          setDisplayName(profile.display_name);
        }
        
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/");
      } else {
        setUser(session.user);
        
        // Fetch display name when user signs in
        setTimeout(async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          if (profile?.display_name) {
            setDisplayName(profile.display_name);
          }
        }, 0);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={benchrightLogo} alt="BenchRight Logo" className="h-36" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">Freemium Plan</p>
                <p className="text-xs text-muted-foreground">
                  {displayName || 'User'}
                </p>
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
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border border-border/50">
            <div className="space-y-4">
              {/* Welcome Header */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  👋 Welcome to BenchRight{displayName ? `, ${displayName}` : ''}!
                </h2>
                <p className="text-base text-muted-foreground">
                  You're on the <span className="font-semibold text-foreground">Freemium plan</span> with access to city-level benchmarks.
                </p>
              </div>

              {/* Call to Action - Only show on profile tab */}
              {activeTab === "profile" && (
                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-2xl">👉</span>
                  <p className="text-sm text-foreground">
                    Start by completing your Total Rewards form — it only takes 2 minutes.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                <h3 className="text-xl font-semibold mb-2 text-foreground">Profile Settings</h3>
                <p className="text-muted-foreground mb-6">
                  Set your default city and industry to prefill forms.
                </p>
                <ProfileSettingsForm 
                  userId={user?.id || ''} 
                  onDisplayNameUpdate={setDisplayName}
                />
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

          {/* Trust & Privacy Footer */}
          <Card className="p-6 bg-muted/30 border-border/50">
            <div className="space-y-4">
              {/* Trust Indicators Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Anonymous by design</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>GDPR compliant (EU)</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>RLS (Row Level Security) enabled</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Server className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Hosted in EU (Frankfurt)</span>
                </div>
              </div>

              {/* Privacy Statement */}
              <div className="pt-3 border-t border-border/50 space-y-2">
                <p className="text-sm text-muted-foreground">
                  At BenchRight, we believe fair pay starts with trust — and trust starts with transparency.
                </p>
                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Privacy Guide",
                      description: "Detailed privacy documentation coming soon. Your data is always encrypted and anonymous by design.",
                    });
                  }}
                >
                  How BenchRight keeps your data safe
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;
