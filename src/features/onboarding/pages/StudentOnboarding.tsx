import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout";
import { ProgressBar, FileUpload, Tag } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown, ChevronUp, Circle } from "lucide-react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/api/supabase";
import { useToast } from "@/hooks/use-toast";
import { INDUSTRIES, formatIndustriesForStorage } from "@/lib/constants/industries";

const STEPS = ["Upload CV", "Your Networking Goal", "Consent"];

const StudentOnboarding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isUpdate = searchParams.get("update") === "true";
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [networkingGoal, setNetworkingGoal] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<Record<string, string[]>>({});
  const [expandedIndustries, setExpandedIndustries] = useState<Set<string>>(new Set());
  const [specificInterests, setSpecificInterests] = useState("");
  const [sendWeeklyUpdates, setSendWeeklyUpdates] = useState(true);
  const [connectWithStudents, setConnectWithStudents] = useState(true);
  const [connectWithAlumni, setConnectWithAlumni] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user has already completed onboarding and redirect to dashboard
  // Skip this check if user is updating their profile
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || loading || isUpdate) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!error && data?.onboarding_completed) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    checkOnboardingStatus();
  }, [user, loading, navigate, isUpdate]);

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

    // Validate that the file is a PDF
    const fileExt = cvFile.name.split(".").pop()?.toLowerCase();
    if (fileExt !== "pdf" || cvFile.type !== "application/pdf") {
      toast({
        title: "Error",
        description: "Only PDF files are allowed for CV uploads.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload CV to storage
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
        user_type: "student" as const,
        email: user.email || "",
        cv_path: filePath,
        cv_uploaded_at: new Date().toISOString(),
        networking_goal: networkingGoal,
        target_industries: formatIndustriesForStorage(selectedIndustries),
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
      localStorage.setItem("userType", "student");

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

  const togglePrimaryIndustry = (primaryIndustry: string) => {
    const industry = INDUSTRIES.find((i) => i.name === primaryIndustry);

    if (!industry) return;

    // If industry has no sub-sectors (like Consulting), toggle it directly
    if (!industry.subSectors || industry.subSectors.length === 0) {
      setSelectedIndustries((prev) => {
        const newSelected = { ...prev };
        if (primaryIndustry in newSelected) {
          delete newSelected[primaryIndustry];
        } else {
          newSelected[primaryIndustry] = [];
        }
        return newSelected;
      });
      return;
    }

    // If industry has sub-sectors, toggle expansion
    setExpandedIndustries((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(primaryIndustry)) {
        newExpanded.delete(primaryIndustry);
      } else {
        newExpanded.add(primaryIndustry);
      }
      return newExpanded;
    });
  };

  const toggleSubSector = (primaryIndustry: string, subSector: string) => {
    setSelectedIndustries((prev) => {
      const newSelected = { ...prev };
      const currentSubSectors = newSelected[primaryIndustry] || [];

      if (currentSubSectors.includes(subSector)) {
        // Remove sub-sector
        const updated = currentSubSectors.filter((s) => s !== subSector);
        if (updated.length === 0) {
          delete newSelected[primaryIndustry];
        } else {
          newSelected[primaryIndustry] = updated;
        }
      } else {
        // Add sub-sector
        newSelected[primaryIndustry] = [...currentSubSectors, subSector];
      }

      return newSelected;
    });
  };

  const isIndustrySelected = (primaryIndustry: string): boolean => {
    return primaryIndustry in selectedIndustries;
  };

  const isSubSectorSelected = (primaryIndustry: string, subSector: string): boolean => {
    return selectedIndustries[primaryIndustry]?.includes(subSector) || false;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return cvFile !== null;
      case 1:
        if (networkingGoal === "") return false;
        if (networkingGoal === "exploring" && Object.keys(selectedIndustries).length === 0) return false;
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
              <FileUpload onFileSelect={setCvFile} acceptedFormats=".pdf" maxSizeMB={1} />
            </div>
          )}

          {/* Step 2: Your Networking Goal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">What is your networking goal?</h2>
                <p className="text-muted-foreground">
                  Help us understand your networking goals
                </p>
              </div>

              <div className="space-y-4">
                <RadioGroup 
                  value={networkingGoal} 
                  onValueChange={(value) => {
                    setNetworkingGoal(value);
                    // Clear industry selection when changing goals
                    setSelectedIndustries([]);
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                      <RadioGroupItem value="exploring" id="exploring" />
                      <Label htmlFor="exploring" className="cursor-pointer flex-1">
                        Exploring specific industries
                      </Label>
                    </div>
                    {networkingGoal === "exploring" && (
                      <div className="ml-8 space-y-3">
                        <Label>Select industries and sub-sectors</Label>
                        <div className="space-y-2">
                          {INDUSTRIES.map((industry) => (
                            <div key={industry.name} className="space-y-2">
                              <div
                                className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                  isIndustrySelected(industry.name)
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/50"
                                }`}
                                onClick={() => togglePrimaryIndustry(industry.name)}
                              >
                                <span className="font-medium">{industry.name}</span>
                                {industry.subSectors && industry.subSectors.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    {isIndustrySelected(industry.name) && (
                                      <span className="text-xs text-muted-foreground">
                                        {selectedIndustries[industry.name]?.length || 0} selected
                                      </span>
                                    )}
                                    {expandedIndustries.has(industry.name) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </div>
                                )}
                              </div>
                              {industry.subSectors &&
                                industry.subSectors.length > 0 &&
                                expandedIndustries.has(industry.name) && (
                                  <div className="ml-4 pl-4 border-l-2 border-border space-y-1">
                                    <div className="flex flex-wrap gap-2 p-3 bg-secondary/50 rounded-lg">
                                      {industry.subSectors.map((subSector) => (
                                        <Tag
                                          key={subSector}
                                          label={subSector}
                                          selected={isSubSectorSelected(industry.name, subSector)}
                                          onToggle={() => toggleSubSector(industry.name, subSector)}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
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
                      Still figuring it out
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific-interests">Tell us what you'd like to discuss</Label>
                <Textarea
                  id="specific-interests"
                  placeholder="e.g., Career transitions, industry insights, mentorship opportunities..."
                  value={specificInterests}
                  onChange={(e) => setSpecificInterests(e.target.value)}
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

              <div className="space-y-4">
                <div
                  className="flex items-center space-x-3 p-4 border-2 border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all"
                  onClick={() => setSendWeeklyUpdates(!sendWeeklyUpdates)}
                >
                  <div className={`aspect-square h-4 w-4 rounded-full border text-primary ring-offset-background flex items-center justify-center ${
                    sendWeeklyUpdates ? "border-primary" : "border-input"
                  }`}>
                    {sendWeeklyUpdates && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
                  </div>
                  <Label htmlFor="send-weekly-updates" className="cursor-pointer flex-1">
                    Send me 3 networking leads every week
                  </Label>
                </div>

                <div
                  className="flex items-center space-x-3 p-4 border-2 border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all"
                  onClick={() => setConnectWithStudents(!connectWithStudents)}
                >
                  <div className={`aspect-square h-4 w-4 rounded-full border text-primary ring-offset-background flex items-center justify-center ${
                    connectWithStudents ? "border-primary" : "border-input"
                  }`}>
                    {connectWithStudents && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
                  </div>
                  <Label htmlFor="connect-students" className="cursor-pointer flex-1">
                    Allow current students to be matched with me
                  </Label>
                </div>

                <div
                  className="flex items-center space-x-3 p-4 border-2 border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all"
                  onClick={() => setConnectWithAlumni(!connectWithAlumni)}
                >
                  <div className={`aspect-square h-4 w-4 rounded-full border text-primary ring-offset-background flex items-center justify-center ${
                    connectWithAlumni ? "border-primary" : "border-input"
                  }`}>
                    {connectWithAlumni && <Circle className="h-2.5 w-2.5 fill-current text-current" />}
                  </div>
                  <Label htmlFor="connect-alumni" className="cursor-pointer flex-1">
                    Allow other alumni to be matched with me
                  </Label>
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

export default StudentOnboarding;
