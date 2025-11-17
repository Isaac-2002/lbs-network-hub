import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
          <Link to="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="#" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link to="#" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2024 London Business School. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
