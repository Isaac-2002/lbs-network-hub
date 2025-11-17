import { Link } from "react-router-dom";
import { GraduationCap, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showAuth?: boolean;
}

export const Header = ({ showAuth = true }: HeaderProps) => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">LBS Connect</span>
          </Link>
          
          {showAuth && (
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
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
