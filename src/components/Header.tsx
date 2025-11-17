import { Link } from "react-router-dom";
import { GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showAuth?: boolean;
}

export const Header = ({ showAuth = true }: HeaderProps) => {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">LBS Connect</span>
          </Link>
          
          {showAuth && (
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
                About
              </Link>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
