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
  const [currentStep, setCurrentStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [goal, setGoal] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [reachOutAbout, setReachOutAbout] = useState("");
  const [sendMatches, setSendMatches] = useState(true);
  const [allowStudents, setAllowStudents] = useState(true);
  const [allowAlumni, setAllowAlumni] = useState(true);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/welcome");
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
        return goal !== "";
      case 2:
        return selectedIndustries.length > 0 && reachOutAbout.trim() !== "";
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getIndustryTitle = () => {
    if (goal === "expand") {
      return "What fields are you interested in?";
    } else if (goal === "pivot") {
      return "Which industry are you targeting?";
    } else if (goal === "give-back") {
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
                <h2 className="text-3xl font-bold text-primary mb-2">What brings you to LBS Connect?</h2>
                <p className="text-muted-foreground">
                  Help us understand your networking goals
                </p>
              </div>

              <RadioGroup value={goal} onValueChange={setGoal} className="space-y-4">
                <div
                  className={`flex items-start space-x-4 p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    goal === "expand" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setGoal("expand")}
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
                    goal === "pivot" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setGoal("pivot")}
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
                    goal === "give-back" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setGoal("give-back")}
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
                  Select the industries you're interested in connecting within
                </p>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="reach-out-about">
                  {goal === "give-back" 
                    ? "What can students and alumni reach out to you about?"
                    : "Tell us what you'd like to discuss"}
                </Label>
                <Textarea
                  id="reach-out-about"
                  value={reachOutAbout}
                  onChange={(e) => setReachOutAbout(e.target.value)}
                  placeholder={
                    goal === "give-back"
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

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="allow-students"
                    checked={allowStudents}
                    onCheckedChange={(checked) => setAllowStudents(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="allow-students" className="cursor-pointer">
                      Allow current students to be matched with me
                    </Label>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="allow-alumni"
                    checked={allowAlumni}
                    onCheckedChange={(checked) => setAllowAlumni(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="allow-alumni" className="cursor-pointer">
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
              disabled={!canProceed()}
              className={currentStep === 0 ? "ml-auto" : ""}
              variant={currentStep === STEPS.length - 1 ? "default" : "default"}
              style={currentStep === STEPS.length - 1 ? { backgroundColor: "hsl(var(--accent))" } : {}}
            >
              {currentStep === STEPS.length - 1 ? "Complete Setup" : "Next"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlumniOnboarding;
