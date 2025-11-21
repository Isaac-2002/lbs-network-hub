import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout";
import { MatchCard } from "../components/MatchCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tag } from "@/components/common";
import { Edit, Sparkles, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/features/auth";
import { useProfile, useProfileService } from "@/features/profile";
import { useMatches, useGenerateRecommendations } from "../hooks/useMatches";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { data: matches, isLoading: matchesLoading, refetch } = useMatches(user?.id);
  const generateRecommendations = useGenerateRecommendations();
  const profileService = useProfileService();
  const [isGenerating, setIsGenerating] = useState(false);

  // Get first name from profile
  const firstName = profile?.first_name || user?.email?.split("@")[0] || "there";

  const handleUpdateStatus = () => {
    navigate("/update-status");
  };

  const handleGenerateRecommendations = async () => {
    if (!user?.id) {
      toast.error("User not found");
      return;
    }

    setIsGenerating(true);
    try {
      await generateRecommendations.mutateAsync(user.id);
      toast.success("Recommendations generated successfully!");
      await refetch();
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate recommendations"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (profileLoading) {
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
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Your Recommended Connections</h2>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={isGenerating || matchesLoading}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Recommendations"}
            </Button>
          </div>

          {matchesLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading matches...</p>
            </div>
          ) : matches && matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <MatchCard
                  key={match.id}
                  firstName={match.matched_profile.first_name}
                  lastName={match.matched_profile.last_name}
                  email={match.matched_profile.email}
                  linkedin={match.matched_profile.linkedin_url}
                  role={match.matched_profile.current_role}
                  lbsProgram={match.matched_profile.lbs_program}
                  graduationYear={match.matched_profile.graduation_year}
                  reason={match.reason}
                  score={match.score}
                />
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No matches found yet. Click "Generate Recommendations" to find compatible connections based on your profile and interests.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
