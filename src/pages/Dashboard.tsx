import { DashboardHeader } from "@/components/DashboardHeader";
import { StatCard } from "@/components/StatCard";
import { MatchCard } from "@/components/MatchCard";
import { Send, Users, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome back, John!</h1>
          <p className="text-muted-foreground">Here's your networking activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Your Recent Matches</h2>
            <Button variant="outline">View All</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMatches.map((match, index) => (
              <MatchCard key={index} {...match} />
            ))}
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="bg-secondary rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Next matches arrive on Monday, Jan 22</h3>
              <p className="text-sm text-muted-foreground">You'll receive 3 new connections in your inbox</p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">5 days until next batch</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
