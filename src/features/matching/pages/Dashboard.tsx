import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout";
import { MatchCard } from "../components/MatchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tag } from "@/components/common";
import { Edit, Search } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useProfile, useProfileService } from "@/features/profile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: loading } = useProfile(user?.id);
  const profileService = useProfileService();

  // Get first name from profile
  const firstName = profile?.first_name || user?.email?.split("@")[0] || "there";

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

  const handleUpdateStatus = () => {
    navigate("/update-status");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <DashboardHeader />
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section 1: My Profile */}
        <div className="mb-16">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Welcome back, {firstName}!
                  </h2>
                </div>
                <Button onClick={handleUpdateStatus} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Update Your Status
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {profile && (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-medium text-foreground capitalize">{profile.user_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Goal</p>
                    <p className="font-medium text-foreground">
                      {profileService.formatNetworkingGoal(profile.networking_goal)}
                    </p>
                  </div>
                  {profile.target_industries && profile.target_industries.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Industries</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.target_industries.map((industry) => (
                          <Tag key={industry} label={industry} variant="selected" />
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.specific_interests && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">What you'd like to discuss</p>
                      <p className="text-foreground">{profile.specific_interests}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section 2: My Matches */}
        <div>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
