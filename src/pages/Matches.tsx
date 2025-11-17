import { DashboardHeader } from "@/components/DashboardHeader";
import { MatchCard } from "@/components/MatchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Matches = () => {
  const allMatches = [
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
    {
      name: "David Park",
      title: "MiM '23 | Product Manager at Google",
      tags: ["Technology", "Product"],
      sentDate: "Jan 8, 2024",
      email: "david.p@example.com",
      linkedin: "https://linkedin.com",
    },
    {
      name: "Lisa Anderson",
      title: "MBA '20 | Partner at Bain & Company",
      tags: ["Consulting", "Strategy"],
      sentDate: "Jan 8, 2024",
      email: "lisa.a@example.com",
      linkedin: "https://linkedin.com",
    },
    {
      name: "James Wright",
      title: "EMBA '21 | VP of Operations at Amazon",
      tags: ["Technology", "Operations"],
      sentDate: "Jan 1, 2024",
      email: "james.w@example.com",
      linkedin: "https://linkedin.com",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">My Matches</h1>
          <p className="text-muted-foreground">Browse all your networking connections</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search matches by name or industry..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            Filter
          </Button>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allMatches.map((match, index) => (
            <MatchCard key={index} {...match} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Matches;
