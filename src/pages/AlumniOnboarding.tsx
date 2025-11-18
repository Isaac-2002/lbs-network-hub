import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { FileUpload } from "@/components/FileUpload";
import { Tag } from "@/components/Tag";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TrendingUp, RefreshCw, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Upload CV", "Your Goals", "Industry Focus", "Consent"];

const INDUSTRIES = [
  "Finance",
  "Consulting",
  "Technology",
  "Healthcare",
  "Real Estate",
  "Private Equity",
  "Venture Capital",
  "Entrepreneurship",
  "Consumer Goods",
  "Energy",
  "Media",
  "Non-Profit",
];

const AlumniOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [networkingGoal, setNetworkingGoal] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [specificInterests, setSpecificInterests] = useState("");
  const [sendWeeklyUpdates, setSendWeeklyUpdates] = useState(true);
  const [connectWithStudents, setConnectWithStudents] = useState(true);
  const [connectWithAlumni, setConnectWithAlumni] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding: upload CV and save profile
      await handleCompleteOnboarding();
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!user || !cvFile) {
      toast({
        title: "Error",
        description: "Please make sure you're logged in and have uploaded a CV.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload CV to storage
      const fileExt = cvFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, cvFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload CV: ${uploadError.message}`);
      }

      // 2. Create/update profile with user input data
      const profileData = {
        user_id: user.id,
        user_type: "alumni" as const,
        email: user.email || "",
        cv_path: filePath,
        cv_uploaded_at: new Date().toISOString(),
        networking_goal: networkingGoal,
        target_industries: selectedIndustries,
        specific_interests: specificInterests || null,
        send_weekly_updates: sendWeeklyUpdates,
        connect_with_students: connectWithStudents,
        connect_with_alumni: connectWithAlumni,
        onboarding_completed: true,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "user_id",
        });

      if (profileError) {
        throw new Error(`Failed to save profile: ${profileError.message}`);
      }

      // 3. Trigger CV extraction (async - doesn't block onboarding completion)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Call edge function to extract CV data
        supabase.functions
          .invoke("extract-cv-data", {
            body: {
              userId: user.id,
              cvPath: filePath,
            },
          })
          .then(({ error: extractError }) => {
            if (extractError) {
              console.error("CV extraction error:", extractError);
            } else {
              console.log("CV extraction started successfully");
            }
          });
      }

      // 4. Store user type for dashboard
      localStorage.setItem("userType", "alumni");

      toast({
        title: "Success!",
        description: "Your profile has been created. We're extracting data from your CV in the background.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return cvFile !== null;
      case 1:
        return networkingGoal !== "";
      case 2:
        // For "give-back" goal, only require specificInterests, not industries
        if (networkingGoal === "give-back") {
          return specificInterests.trim() !== "";
        }
        return selectedIndustries.length > 0 && specificInterests.trim() !== "";
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getIndustryTitle = () => {
    if (networkingGoal === "expand") {
      return "What fields are you interested in?";
    } else if (networkingGoal === "pivot") {
      return "Which industry are you targeting?";
    } else if (networkingGoal === "give-back") {
      return "Which industries are you interested in?";
    }
    return "Select Industries";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showAuth={false} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <ProgressBar steps={STEPS} currentStep={currentStep} />

          {/* Step 1: CV Upload */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Upload Your CV</h2>
                <p className="text-muted-foreground">
                  We'll extract your information to create your profile
                </p>
              </div>
              <FileUpload onFileSelect={setCvFile} />
            </div>
          )}

          {/* Step 2: Goals */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">What are your networking goals?</h2>
                <p className="text-muted-foreground">
                  Help us understand your networking goals
                </p>
              </div>

              <RadioGroup value={networkingGoal} onValueChange={setNetworkingGoal} className="space-y-4">
                <div
                  className={`flex items-start space-x-4 p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    networkingGoal === "expand" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setNetworkingGoal("expand")}
                >
                  <RadioGroupItem value="expand" id="expand" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <Label htmlFor="expand" className="text-lg font-semibold cursor-pointer">
                        Expand my network in my current industry
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect with others in your field to strengthen your professional network
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-start space-x-4 p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    networkingGoal === "pivot" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setNetworkingGoal("pivot")}
                >
                  <RadioGroupItem value="pivot" id="pivot" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RefreshCw className="h-5 w-5 text-primary" />
                      <Label htmlFor="pivot" className="text-lg font-semibold cursor-pointer">
                        I'm pivoting to a new industry
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Build connections in a new field as you transition your career
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-start space-x-4 p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    networkingGoal === "give-back" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setNetworkingGoal("give-back")}
                >
                  <RadioGroupItem value="give-back" id="give-back" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <Label htmlFor="give-back" className="text-lg font-semibold cursor-pointer">
                        I want to give back to the LBS community
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Share your experience and mentor the next generation of LBS leaders
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Industry Focus */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">{getIndustryTitle()}</h2>
                <p className="text-muted-foreground">
                  {networkingGoal === "give-back"
                    ? "Tell us what you'd like to help with"
                    : "Select the industries you're interested in connecting within"}
                </p>
              </div>

              {networkingGoal !== "give-back" && (
                <div className="space-y-2">
                  <Label>Select industries</Label>
                  <div className="flex flex-wrap gap-2 p-4 bg-secondary rounded-lg">
                    {INDUSTRIES.map((industry) => (
                      <Tag
                        key={industry}
                        label={industry}
                        selected={selectedIndustries.includes(industry)}
                        onToggle={() => toggleIndustry(industry)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="specific-interests">
                  {networkingGoal === "give-back" 
                    ? "What can students and alumni reach out to you about?"
                    : "Tell us what you'd like to discuss"}
                </Label>
                <Textarea
                  id="specific-interests"
                  value={specificInterests}
                  onChange={(e) => setSpecificInterests(e.target.value)}
                  placeholder={
                    networkingGoal === "give-back"
                      ? "Share what topics, questions, or areas students and alumni can reach out to you about..."
                      : "Share what you'd like to discuss with your network connections..."
                  }
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 4: Consent */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">How would you like to participate?</h2>
                <p className="text-muted-foreground">
                  Customize your networking preferences
                </p>
              </div>

              <div className="space-y-4 p-6 bg-secondary rounded-lg">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="send-weekly-updates"
                    checked={sendWeeklyUpdates}
                    onCheckedChange={(checked) => setSendWeeklyUpdates(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="send-weekly-updates" className="cursor-pointer">
                      Send me 3 networking matches every week via email
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="connect-students"
                    checked={connectWithStudents}
                    onCheckedChange={(checked) => setConnectWithStudents(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="connect-students" className="cursor-pointer">
                      Allow current students to be matched with me
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="connect-alumni"
                    checked={connectWithAlumni}
                    onCheckedChange={(checked) => setConnectWithAlumni(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="connect-alumni" className="cursor-pointer">
                      Allow other alumni to be matched with me
                    </Label>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Your email and LinkedIn will be extracted from your CV and used for matches.
                  We respect your privacy and you can update these preferences anytime in settings.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className={currentStep === 0 ? "ml-auto" : ""}
              variant={currentStep === STEPS.length - 1 ? "default" : "default"}
              style={currentStep === STEPS.length - 1 ? { backgroundColor: "hsl(var(--accent))" } : {}}
            >
              {isSubmitting
                ? "Saving..."
                : currentStep === STEPS.length - 1
                ? "Complete Setup"
                : "Next"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlumniOnboarding;
