import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const DashboardHeader = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link 
            to="/dashboard" 
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
          
          <nav className="hidden md:flex items-center gap-3">
            {navItems
              .filter((item) => 
                !(location.pathname === "/dashboard" && item.to === "/dashboard") &&
                !(location.pathname === "/update-status" && item.to === "/dashboard") &&
                !(location.pathname === "/settings" && item.to === "/dashboard")
              )
              .map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                    location.pathname === item.to 
                      ? "bg-secondary text-foreground" 
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="h-5 w-5 text-background" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border/50">
              {user && (
                <div className="px-2 py-1.5 text-sm text-muted-foreground border-b border-border/50">
                  {user.email}
                </div>
              )}
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
        </div>
      </div>
    </header>
  );
};
