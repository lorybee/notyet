import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import benchrightLogo from "@/assets/benchright-logo.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="bg-muted/30 border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <img src={benchrightLogo} alt="BenchRight Logo" className="h-16" />
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="text-base">
                Features
              </Button>
              <Button variant="ghost" className="text-base">
                Pricing
              </Button>
              <Button variant="ghost" className="text-base">
                About
              </Button>
              <Button variant="ghost" onClick={() => navigate("/auth")} className="text-base">
                Sign In
              </Button>
              <Button onClick={() => navigate("/auth")} size="lg" className="text-base">
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="bg-primary text-primary-foreground py-3 px-6 rounded-lg inline-flex items-center gap-2 text-sm mb-2">
            <Shield className="h-4 w-4" />
            Anonymous & Secure
          </div>
          
          <div className="bg-primary text-primary-foreground py-6 px-8 rounded-lg max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              BenchRight <span className="text-green-400">Clear Pay+</span>
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold leading-tight pt-4">
            <span className="text-blue-600">Together</span>{" "}
            <span className="text-green-600">for fair pay.</span>{" "}
            <span className="text-orange-500">Powered by data.</span>{" "}
            <span className="text-blue-600">Driven by people.</span>
          </h2>
          
          <p className="text-xl text-foreground font-medium pt-4 max-w-3xl mx-auto">
            Transparent compensation benchmarking for Romania's workforce.
          </p>
          
          <p className="text-lg text-foreground max-w-3xl mx-auto">
            Compare real salaries, understand purchasing power, and know your rights. All powered by anonymized data and AI insights.
          </p>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 border-primary bg-card">
            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mb-4 mx-auto">
              <Users className="h-10 w-10 text-primary-foreground" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-foreground">Employee</h4>
            <p className="text-muted-foreground mb-6 text-sm">
              See where your salary stands and what benefits you deserve
            </p>
            <Button onClick={() => navigate("/auth")} className="w-full">
              Continue as Employee
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 bg-card opacity-75">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-foreground">Employer</h4>
            <p className="text-muted-foreground mb-6 text-sm">
              Benchmark fair pay and build trust with your team
            </p>
            <Button variant="outline" disabled className="w-full">
              Coming Soon
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 bg-card opacity-75">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4 mx-auto">
              <Users className="h-10 w-10 text-muted-foreground" />
            </div>
            <h4 className="text-xl font-bold mb-3 text-foreground">Social Partners</h4>
            <p className="text-muted-foreground mb-6 text-sm">
              Track workforce trends and pay equity data
            </p>
            <Button variant="outline" disabled className="w-full">
              Coming Soon
            </Button>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/20">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Make Informed Decisions
          </h3>
          <p className="text-muted-foreground text-lg">
            Comprehensive tools to understand your compensation, compare opportunities, and know your workplace rights.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-foreground">Data-Driven</h4>
            <p className="text-muted-foreground text-sm">
              Anonymous compensation data aggregated for accurate market insights
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-foreground">People-Powered</h4>
            <p className="text-muted-foreground text-sm">
              Built by employees, for employees seeking pay transparency
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 mx-auto">
              <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-foreground">Fair Pay</h4>
            <p className="text-muted-foreground text-sm">
              Compare compensation and understand your rights under Romanian law
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 max-w-6xl mx-auto mb-8">
            <div>
              <img src={benchrightLogo} alt="BenchRight Logo" className="h-24 mb-4" />
            </div>
            
            <div>
              <h5 className="font-semibold text-foreground mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Features</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Pricing</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Security</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Knowledge Base</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Labour Law Guide</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Salary Reports</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</li>
                <li className="hover:text-foreground cursor-pointer transition-colors">AGPL-3.0 License</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t border-border/50">
            <p>© 2025 BenchRight. Open source under AGPL-3.0. Data hosted in the EU (Frankfurt region).</p>
            <p>Developed by Team EmpowerAI – KnowYourRights</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
