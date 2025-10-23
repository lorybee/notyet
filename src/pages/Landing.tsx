import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Shield, TrendingUp, Users, BarChart3, MessageSquare, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">BenchRight</h1>
              <p className="text-xs text-muted-foreground">Clear Pay+</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button onClick={() => navigate("/auth")} className="group">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Together for fair pay
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
            Powered by data.
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Driven by people.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transparent, data-driven compensation benchmarking for Romania's workforce. 
            Compare salaries anonymously, understand your rights, and negotiate with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg h-14 px-8 group">
              Employee Access
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-14 px-8">
              View Demo
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Anonymous by Design</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-secondary" />
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Why BenchRight?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools to understand your compensation and workplace rights
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-foreground">Salary Benchmarking</h4>
            <p className="text-muted-foreground">
              Compare your total rewards with city, industry, and role-specific averages. 
              See where you stand with percentile rankings.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-foreground">AI-Powered Insights</h4>
            <p className="text-muted-foreground">
              Get personalized recommendations on skills, benefits, and negotiation strategies 
              based on real market data.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Calculator className="h-6 w-6 text-accent" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-foreground">Purchasing Power</h4>
            <p className="text-muted-foreground">
              Understand real salary changes with our Salary Time Machine. 
              Compare 2020 vs 2025 adjusted for inflation.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-foreground">Labour Law Chat</h4>
            <p className="text-muted-foreground">
              Ask questions about Romanian labour legislation with text or voice. 
              Get instant answers on leave, benefits, and rights.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-secondary" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-foreground">Privacy First</h4>
            <p className="text-muted-foreground">
              Your data is anonymized and never linked to your account. 
              Open algorithms, RLS secured, EU data residency.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-border/50 backdrop-blur-sm">
            <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-foreground">Community Driven</h4>
            <p className="text-muted-foreground">
              Open source under AGPL-3.0. Built transparently to drive fair 
              labour relations across Romania.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Choose Your Plan</h3>
          <p className="text-muted-foreground">Start with freemium, upgrade as you grow</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 border-border/50 hover:shadow-xl transition-all duration-300">
            <div className="text-center space-y-4">
              <h4 className="text-2xl font-bold text-foreground">Freemium</h4>
              <div className="text-4xl font-bold text-foreground">Free</div>
              <p className="text-muted-foreground">City-level data</p>
              <Button onClick={() => navigate("/auth")} variant="outline" className="w-full">
                Get Started
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-primary shadow-lg scale-105 hover:shadow-2xl transition-all duration-300">
            <div className="text-center space-y-4">
              <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-2">
                Popular
              </div>
              <h4 className="text-2xl font-bold text-foreground">Plus</h4>
              <div className="text-4xl font-bold text-foreground">Coming Soon</div>
              <p className="text-muted-foreground">National data</p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </Card>

          <Card className="p-8 border-border/50 hover:shadow-xl transition-all duration-300">
            <div className="text-center space-y-4">
              <h4 className="text-2xl font-bold text-foreground">Premium</h4>
              <div className="text-4xl font-bold text-foreground">Coming Soon</div>
              <p className="text-muted-foreground">EU-wide data</p>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="p-12 text-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-none">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground">
              Ready to discover your fair pay?
            </h3>
            <p className="text-xl text-muted-foreground">
              Join thousands of employees who are negotiating with confidence
            </p>
            <Button size="lg" onClick={() => navigate("/auth")} className="text-lg h-14 px-8 group">
              Start Benchmarking Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">BenchRight</span>
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
