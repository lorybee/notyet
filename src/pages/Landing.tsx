import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Users, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import benchrightLogo from "@/assets/benchright-logo.png";
import { Footer } from "@/components/Footer";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      {/* Header */}
      <header className="bg-muted/30 border-b border-border/50">
        <div className="container mx-auto px-4 py-2">
          <nav className="flex items-center justify-between">
            <img src={benchrightLogo} alt="BenchRight Logo" className="h-40" />
            <div className="flex items-center gap-6">
              <Button variant="ghost" className="text-base">
                Features
              </Button>
              <Button variant="ghost" onClick={() => navigate("/pricing")} className="text-base">
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
          <div className="bg-[#2B5AA8] text-white py-8 px-8 rounded-lg max-w-4xl mx-auto">
            <div className="text-sm mb-4 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4" />
              Anonymous & Secure
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              BenchRight <span className="text-[#5FD896]">Clear Pay+</span>
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-semibold leading-relaxed pt-4 space-y-2">
            <div 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #1D4E89, #2E8B57)' }}
            >
              Together for fair pay.
            </div>
            <div 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F5B700, #CC8800)' }}
            >
              Powered by data.
            </div>
            <div 
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #2E8B57, #1D4E89)' }}
            >
              Driven by people.
            </div>
          </h2>
          
          <p className="text-xl text-foreground font-medium pt-6 max-w-3xl mx-auto">
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
            <Button onClick={() => navigate("/pricing")} className="w-full">
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
      <Footer />
    </div>
  );
};

export default Landing;
