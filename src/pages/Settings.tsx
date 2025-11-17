import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
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

const Settings = () => {
  const { toast } = useToast();
  const [emailMatches, setEmailMatches] = useState(true);
  const [allowMatching, setAllowMatching] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [matchNotifications, setMatchNotifications] = useState(true);
  const [connectWithStudents, setConnectWithStudents] = useState(true);
  const [connectWithAlumni, setConnectWithAlumni] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const handleSave = () => {
    toast({
      title: "Settings updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    toast({
      title: isPaused ? "Matching resumed" : "Matching paused",
      description: isPaused 
        ? "You'll start receiving matches again next week."
        : "You won't receive new matches until you resume.",
    });
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
            {/* Email Preferences */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">Email Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how you want to receive notifications
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-matches">Weekly Match Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive 3 matches every week via email
                      </p>
                    </div>
                    <Switch
                      id="email-matches"
                      checked={emailMatches}
                      onCheckedChange={setEmailMatches}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weekly-digest">Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Summary of your networking activity
                      </p>
                    </div>
                    <Switch
                      id="weekly-digest"
                      checked={weeklyDigest}
                      onCheckedChange={setWeeklyDigest}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="match-notifications">Match Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone views your profile
                      </p>
                    </div>
                    <Switch
                      id="match-notifications"
                      checked={matchNotifications}
                      onCheckedChange={setMatchNotifications}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Matching Preferences */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">Matching Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile and who you want to connect with
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allow-matching">Allow Matching</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others be matched with you
                      </p>
                    </div>
                    <Switch
                      id="allow-matching"
                      checked={allowMatching}
                      onCheckedChange={setAllowMatching}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <Label className="mb-3 block">I want to connect with:</Label>
                    <div className="space-y-3 pl-2">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="connect-students"
                          checked={connectWithStudents}
                          onCheckedChange={(checked) => setConnectWithStudents(checked as boolean)}
                        />
                        <Label htmlFor="connect-students" className="cursor-pointer">
                          Current Students
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="connect-alumni"
                          checked={connectWithAlumni}
                          onCheckedChange={(checked) => setConnectWithAlumni(checked as boolean)}
                        />
                        <Label htmlFor="connect-alumni" className="cursor-pointer">
                          Alumni
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pause Matching */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">Pause Matching</h3>
                    <p className="text-sm text-muted-foreground">
                      Temporarily stop receiving new matches
                    </p>
                  </div>
                  <Button
                    variant={isPaused ? "default" : "outline"}
                    onClick={handlePauseToggle}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                </div>
                {isPaused && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      Matching is currently paused. You won't receive new matches until you resume.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>Save Preferences</Button>
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
