import benchrightLogo from "@/assets/benchright-logo.png";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12 max-w-6xl mx-auto mb-8">
          <div>
            <img src={benchrightLogo} alt="BenchRight Logo" className="h-24 mb-4" />
          </div>
          
          <div>
            <h5 className="font-semibold text-foreground mb-4">Product</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer transition-colors">Features</li>
              <li className="hover:text-foreground cursor-pointer transition-colors">
                <Link to="/pricing">Pricing</Link>
              </li>
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
          <p>© 2025 BenchRight – Clear Pay+ | Built for transparency and fairness.</p>
          <p>Source available for hackathon evaluation. All rights reserved.</p>
          <p>Developed by Team EmpowerAI – KnowYourRights</p>
        </div>
      </div>
    </footer>
  );
};