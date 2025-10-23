import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Footer } from "@/components/Footer";
import benchrightLogo from "@/assets/benchright-logo.png";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b border-border/50 py-4 px-4 bg-muted/30">
        <div className="container mx-auto">
          <Link to="/" className="hover:opacity-80 transition-opacity inline-block">
            <img src={benchrightLogo} alt="BenchRight Logo" className="h-40" />
          </Link>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="mb-4 text-6xl font-bold text-foreground">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <Link to="/">
            <Button size="lg">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
