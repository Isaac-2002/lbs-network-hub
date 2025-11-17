import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { FileUpload } from "@/components/FileUpload";
import { Tag } from "@/components/Tag";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const STEPS = ["Upload CV", "Your Interests", "Career Goals", "Consent"];

const PROGRAMS = [
  "Masters in Management",
  "Masters in Finance",
  "Masters in Analytics",
  "MBA",
  "Other",
];

const INTERESTS = [
  "Finance",
  "Consulting",
  "Technology",
  "Entrepreneurship",
  "Marketing",
  "Operations",
  "Healthcare",
  "Real Estate",
  "Private Equity",
  "Venture Capital",
  "Sustainability",
  "Non-Profit",
];

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
  const [currentStep, setCurrentStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [program, setProgram] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [specificInterests, setSpecificInterests] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [targetIndustries, setTargetIndustries] = useState<string[]>([]);
  const [goalsDescription, setGoalsDescription] = useState("");
  const [sendMatches, setSendMatches] = useState(true);
  const [allowMatching, setAllowMatching] = useState(true);
  const [connectWithStudents, setConnectWithStudents] = useState(true);
  const [connectWithAlumni, setConnectWithAlumni] = useState(true);

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

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest("");
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return cvFile !== null;
      case 1:
        return selectedInterests.length > 0 && program !== "";
      case 2:
        return careerGoal !== "";
      case 3:
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

          {/* Step 2: Program & Interests */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Tell us about yourself</h2>
                <p className="text-muted-foreground">
                  Help us understand your background and interests
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Select your program</Label>
                <Select value={program} onValueChange={setProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your program" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((prog) => (
                      <SelectItem key={prog} value={prog}>
                        {prog}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>What are your areas of interest?</Label>
                <div className="flex flex-wrap gap-2 p-4 bg-secondary rounded-lg">
                  {INTERESTS.map((interest) => (
                    <Tag
                      key={interest}
                      label={interest}
                      selected={selectedInterests.includes(interest)}
                      onToggle={() => toggleInterest(interest)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-interest">Add custom interest</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-interest"
                    value={customInterest}
                    onChange={(e) => setCustomInterest(e.target.value)}
                    placeholder="e.g., fintech, impact investing..."
                    onKeyPress={(e) => e.key === "Enter" && addCustomInterest()}
                  />
                  <Button type="button" onClick={addCustomInterest}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specific-interests">Any specific interests or niches? (Optional)</Label>
                <Textarea
                  id="specific-interests"
                  value={specificInterests}
                  onChange={(e) => setSpecificInterests(e.target.value)}
                  placeholder="e.g., fintech, impact investing, B2B SaaS..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Career Goals */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">What are your post-graduation goals?</h2>
                <p className="text-muted-foreground">
                  Share your career aspirations with us
                </p>
              </div>

              <RadioGroup value={careerGoal} onValueChange={setCareerGoal}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                  <RadioGroupItem value="exploring" id="exploring" />
                  <Label htmlFor="exploring" className="cursor-pointer flex-1">
                    Exploring multiple industries
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="cursor-pointer flex-1">
                    Targeting specific industry
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                  <RadioGroupItem value="entrepreneurship" id="entrepreneurship" />
                  <Label htmlFor="entrepreneurship" className="cursor-pointer flex-1">
                    Entrepreneurship/Starting my own venture
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:border-primary transition-colors">
                  <RadioGroupItem value="figuring-out" id="figuring-out" />
                  <Label htmlFor="figuring-out" className="cursor-pointer flex-1">
                    Still figuring it out
                  </Label>
                </div>
              </RadioGroup>

              {careerGoal === "specific" && (
                <div className="space-y-2">
                  <Label>Select target industries</Label>
                  <div className="flex flex-wrap gap-2 p-4 bg-secondary rounded-lg">
                    {INDUSTRIES.map((industry) => (
                      <Tag
                        key={industry}
                        label={industry}
                        selected={targetIndustries.includes(industry)}
                        onToggle={() => {
                          setTargetIndustries((prev) =>
                            prev.includes(industry)
                              ? prev.filter((i) => i !== industry)
                              : [...prev, industry]
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="goals-description">Tell us more about your goals (Optional)</Label>
                <Textarea
                  id="goals-description"
                  value={goalsDescription}
                  onChange={(e) => setGoalsDescription(e.target.value)}
                  placeholder="Share 2-3 sentences about your career aspirations..."
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
                    id="allow-matching"
                    checked={allowMatching}
                    onCheckedChange={(checked) => setAllowMatching(checked as boolean)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="allow-matching" className="cursor-pointer">
                      Allow others to be matched with me
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

export default StudentOnboarding;
