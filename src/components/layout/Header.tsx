import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { AuthDialog } from "@/features/auth/components/AuthDialog";
import { supabase } from "@/lib/api/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showAuth?: boolean;
}

export const Header = ({ showAuth = true }: HeaderProps) => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || loading) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!error && data?.onboarding_completed) {
          setOnboardingCompleted(true);
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [user, loading]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (user && onboardingCompleted) {
      e.preventDefault();
      navigate("/dashboard");
    }
  };

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            to={user && onboardingCompleted ? "/dashboard" : "/"} 
            onClick={handleLogoClick}
            className="flex items-center gap-3"
          >
            <img 
              src="/LBS.png" 
              alt="LBS Logo" 
              className="h-10 w-10 object-contain"
            />
            <span className="text-2xl font-bold text-foreground">LBS Connect</span>
          </Link>
          
          {showAuth && (
            <nav className="flex items-center gap-4">
              {loading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <User className="h-4 w-4 text-background" />
                      </div>
                      <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAuthDialogOpen(true)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </nav>
          )}
        </div>
      </div>
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultMode="signin"
      />
    </header>
  );
};
