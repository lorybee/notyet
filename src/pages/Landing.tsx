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
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <img src={benchrightLogo} alt="BenchRight Logo" className="h-12" />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Together for fair pay.
            </span>{" "}
            <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
              Powered by data.
            </span>{" "}
            <span className="bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              Driven by people.
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent salary benchmarking for Romanian employees. Know your worth, understand the market.
          </p>
        </div>
      </section>

      {/* Features Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-foreground">Data-Driven</h4>
            <p className="text-muted-foreground">
              Anonymous compensation data aggregated for accurate market insights
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 mx-auto">
              <Users className="h-8 w-8 text-secondary" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-foreground">People-Powered</h4>
            <p className="text-muted-foreground">
              Built by employees, for employees seeking pay transparency
            </p>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 mx-auto">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h4 className="text-xl font-semibold mb-3 text-foreground">Fair Pay</h4>
            <p className="text-muted-foreground">
              Compare compensation and understand your rights under Romanian law
            </p>
          </Card>
        </div>
      </section>

      {/* User Type Selection */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")} 
              className="h-16 text-lg"
            >
              Employee
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 text-lg"
              disabled
            >
              Employer
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-16 text-lg"
              disabled
            >
              Government/Policymakers
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Start by creating an employee account to contribute your data and view market benchmarks
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <img src={benchrightLogo} alt="BenchRight Logo" className="h-10" />
              </div>
              <p className="text-sm text-muted-foreground">
                Together for fair pay. Powered by data. Driven by people.
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-foreground mb-4">Product</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Knowledge Base</li>
                <li>Labour Law Guide</li>
                <li>Salary Reports</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-foreground mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>AGPL-3.0 License</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>© 2025 BenchRight. Open source under AGPL-3.0. Data hosted in the EU (Frankfurt region).</p>
            <p className="mt-2">Developed by Team EmpowerAI – KnowYourRights</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
