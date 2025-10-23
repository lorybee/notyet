import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import benchrightLogo from "@/assets/benchright-logo.png";

const Pricing = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handlePlanClick = (planName: string) => {
    if (planName === "Freemium") {
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    } else {
      // For Pro and Premium plans, redirect to auth/dashboard
      if (session) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  };

  const plans = [
    {
      name: "Freemium",
      description: "Benchmark and insights for your city",
      price: "Free",
      features: [
        "Access to your city data",
        "Basic salary benchmarks",
        "Market insights for your location",
        "Community support"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      description: "Access to Romania data",
      price: "€9.99",
      period: "/month",
      features: [
        "All Freemium features",
        "Full Romania database access",
        "Advanced analytics",
        "Export reports",
        "Priority support"
      ],
      cta: "Start Pro Trial",
      highlighted: true
    },
    {
      name: "Premium",
      description: "Access to Europe data",
      price: "€29.99",
      period: "/month",
      features: [
        "All Pro features",
        "Full European database access",
        "Cross-country comparisons",
        "API access",
        "Custom reports",
        "Dedicated account manager"
      ],
      cta: "Start Premium Trial",
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 py-4 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src={benchrightLogo} alt="BenchRight Logo" className="h-40" />
          </Link>
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground">Select the perfect plan for your compensation insights needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.highlighted ? "border-primary shadow-xl scale-105 bg-primary/5" : "hover:border-primary/50 transition-all"}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-4">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-lg">{plan.period}</span>}
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => handlePlanClick(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
