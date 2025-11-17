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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const STEPS = ["Upload CV", "Your Interests", "Consent"];

const INDUSTRIES = [
  "Finance",
  "Consulting",
  "Technology",
  "Healthcare",
  "Real Estate",
  "Consumer Goods",
  "Energy",
  "Media",
];

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [postGraduationGoal, setPostGraduationGoal] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [specificInterests, setSpecificInterests] = useState("");
  const [sendMatches, setSendMatches] = useState(true);
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

      // 2. Update or insert profile
      const profileData = {
        user_type: "student" as const,
        cv_path: filePath,
        post_graduation_goal: postGraduationGoal || null,
        selected_industries: selectedIndustries,
        specific_interests: specificInterests || null,
        send_matches: sendMatches,
        connect_with_students: connectWithStudents,
        connect_with_alumni: connectWithAlumni,
        email: user.email || null,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            ...profileData,
          },
          {
            onConflict: "id",
          }
        );

      if (profileError) {
        throw new Error(`Failed to save profile: ${profileError.message}`);
      }

      // 4. Store user type for "Update Your Status" button
      localStorage.setItem("userType", "student");

      toast({
        title: "Success!",
        description: "Your profile has been created successfully.",
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
    // Multi-select mode: toggle the industry
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
        if (postGraduationGoal === "") return false;
        if (postGraduationGoal === "exploring" && selectedIndustries.length === 0) return false;
        return true;
      case 2:
        return true;
      default:
        return false;
    }
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

          {/* Step 2: Your Interests */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Your Interests</h2>
                <p className="text-muted-foreground">
                  Help us understand your background and career goals
                </p>
              </div>

              {/* Question 1: What are your post-graduation goals? */}
              <div className="space-y-4">
                <Label>What are your post-graduation goals?</Label>
                <RadioGroup 
                  value={postGraduationGoal} 
                  onValueChange={(value) => {
                    setPostGraduationGoal(value);
                    // Clear industry selection when changing goals
                    setSelectedIndustries([]);
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                      <RadioGroupItem value="exploring" id="exploring" />
                      <Label htmlFor="exploring" className="cursor-pointer flex-1">
                        Select industries
                      </Label>
                    </div>
                    {postGraduationGoal === "exploring" && (
                      <div className="ml-8 space-y-2">
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
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                    <RadioGroupItem value="venture" id="venture" />
                    <Label htmlFor="venture" className="cursor-pointer flex-1">
                      Starting my own venture
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                    <RadioGroupItem value="figuring-out" id="figuring-out" />
                    <Label htmlFor="figuring-out" className="cursor-pointer flex-1">
                      Still figuring out
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Question 2: Any specific interests? */}
              <div className="space-y-2">
                <Label htmlFor="specific-interests">Any specific interests?</Label>
                <Textarea
                  id="specific-interests"
                  value={specificInterests}
                  onChange={(e) => setSpecificInterests(e.target.value)}
                  placeholder="Share any specific interests or areas you'd like to explore..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Consent */}
          {currentStep === 2 && (
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
                    id="send-matches"
                    checked={sendMatches}
                    onCheckedChange={(checked) => setSendMatches(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="send-matches" className="cursor-pointer">
                      Send me 3 networking matches every week via email
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>I want to connect with:</Label>
                <div className="space-y-3 pl-4">
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

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Your email and LinkedIn will be extracted from your CV and used for matches.
                  By signing up for this service, you allow others to be matched with you.
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

export default StudentOnboarding;
