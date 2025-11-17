import { Link, useLocation } from "react-router-dom";
import { GraduationCap, LayoutDashboard, Users, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const DashboardHeader = () => {
  const location = useLocation();
  
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/matches", label: "My Matches", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">LBS Connect</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-3">
            {navItems.map((item) => (
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
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
