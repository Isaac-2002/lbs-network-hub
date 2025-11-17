import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { MatchCard } from "@/components/MatchCard";
import { Send, Users, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  // Mock data
  const stats = {
    totalMatches: 12,
    activeConnections: 8,
    profileViews: 24,
  };

  const recentMatches = [
    {
      name: "Sarah Johnson",
      title: "MBA '22 | Investment Banking at Goldman Sachs",
      tags: ["Finance", "MBA"],
      sentDate: "Jan 15, 2024",
      email: "sarah.j@example.com",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Michael Chen",
      title: "MiF '23 | Private Equity Analyst",
      tags: ["Finance", "Private Equity"],
      sentDate: "Jan 15, 2024",
      email: "michael.c@example.com",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Emma Williams",
      title: "MBA '21 | Senior Consultant at McKinsey",
      tags: ["Consulting", "MBA"],
      sentDate: "Jan 15, 2024",
      email: "emma.w@example.com",
      linkedin: "https://linkedin.com",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 tracking-tight">Welcome back, John!</h1>
          <p className="text-lg text-muted-foreground">Here's your networking activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <StatCard
            title="Total Matches Sent"
            value={stats.totalMatches}
            icon={Send}
          />
          <StatCard
            title="Active Connections"
            value={stats.activeConnections}
            icon={Users}
          />
          <StatCard
            title="Profile Views"
            value={stats.profileViews}
            icon={Eye}
          />
        </div>

        {/* Recent Matches Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Your Recent Matches</h2>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMatches.map((match, index) => (
              <MatchCard key={index} {...match} />
            ))}
          </div>
        </div>

        {/* Upcoming Section */}
        <Card className="bg-gradient-to-br from-card to-secondary/30 border-border/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <CardContent className="p-8 relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Calendar className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Next matches arrive on Monday, Jan 22</h3>
                <p className="text-sm text-muted-foreground">You'll receive 3 new connections in your inbox</p>
              </div>
            </div>
            <div className="w-full bg-secondary/50 rounded-full h-3 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-500" style={{ width: "65%" }}></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">5 days until next batch</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
