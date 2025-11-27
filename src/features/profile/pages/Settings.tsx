import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/api/supabase";
import { useGenerateRecommendationsAndSendEmail } from "@/features/matching/hooks/useMatches";

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const generateRecommendationsAndSendEmail = useGenerateRecommendationsAndSendEmail();
  const [weeklyMatchEmails, setWeeklyMatchEmails] = useState(true);
  const [connectWithStudents, setConnectWithStudents] = useState(true);
  const [connectWithAlumni, setConnectWithAlumni] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("send_weekly_updates, connect_with_students, connect_with_alumni")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error loading preferences:", error);
          toast({
            title: "Error",
            description: "Failed to load your preferences. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setWeeklyMatchEmails(data.send_weekly_updates ?? true);
          setConnectWithStudents(data.connect_with_students ?? true);
          setConnectWithAlumni(data.connect_with_alumni ?? true);
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load your preferences. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user, toast]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save preferences.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          send_weekly_updates: weeklyMatchEmails,
          connect_with_students: connectWithStudents,
          connect_with_alumni: connectWithAlumni,
        })
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Regenerate matches since connection preferences changed
      // This affects the matching pool (who the user can be matched with)
      console.log("Regenerating matches after preference changes...");
      try {
        await generateRecommendationsAndSendEmail.mutateAsync(user.id);
        console.log("Matches regenerated successfully");
      } catch (matchError) {
        console.error("Error regenerating matches:", matchError);
        // Don't fail the settings save if match generation fails
      }

      toast({
        title: "Settings updated",
        description: "Your preferences have been saved and matches have been updated.",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and matching settings</p>
          </div>

          <div className="space-y-6">
            {/* Settings Options */}
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Weekly Match Emails */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="weekly-match-emails">Weekly match emails</Label>
                  </div>
                  <Switch
                    id="weekly-match-emails"
                    checked={weeklyMatchEmails}
                    onCheckedChange={setWeeklyMatchEmails}
                    disabled={loading}
                  />
                </div>

                {/* Connect With Section */}
                <div className="pt-4 border-t">
                  <Label className="mb-3 block">I want to connect with:</Label>
                  <div className="space-y-3 pl-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="connect-students"
                        checked={connectWithStudents}
                        onCheckedChange={(checked) => setConnectWithStudents(checked as boolean)}
                        disabled={loading}
                      />
                      <Label htmlFor="connect-students" className="cursor-pointer">
                        Students
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="connect-alumni"
                        checked={connectWithAlumni}
                        onCheckedChange={(checked) => setConnectWithAlumni(checked as boolean)}
                        disabled={loading}
                      />
                      <Label htmlFor="connect-alumni" className="cursor-pointer">
                        Alumni
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={loading || saving}>
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>

            {/* Danger Zone */}
            <Card className="border-destructive">
              <CardContent className="p-6">
                <div>
                  <h3 className="font-semibold text-lg text-destructive mb-1">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
