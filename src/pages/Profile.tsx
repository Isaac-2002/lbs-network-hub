import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FileUpload } from "@/components/FileUpload";
import { Tag } from "@/components/Tag";
import { User, Mail, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@lbs.edu");
  const [linkedIn, setLinkedIn] = useState("linkedin.com/in/johndoe");
  const [program, setProgram] = useState("MBA");
  const [summary, setSummary] = useState(
    "Experienced professional with a background in finance and technology. Currently pursuing an MBA to transition into strategic consulting roles."
  );
  const [interests, setInterests] = useState(["Finance", "Technology", "Consulting"]);

  const handleSave = () => {
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your profile information and preferences</p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Profile Photo</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Update your profile picture (coming soon)
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      Change Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold text-lg text-foreground mb-4">Basic Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Input
                    id="program"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      className="pl-10"
                      value={linkedIn}
                      onChange={(e) => setLinkedIn(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">Professional Summary</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This summary is generated from your CV and shown to your matches
                  </p>
                </div>
                
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                />
              </CardContent>
            </Card>

            {/* Interests */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {interests.map((interest) => (
                    <Tag
                      key={interest}
                      label={interest}
                      variant="selected"
                      onRemove={() => {
                        setInterests(interests.filter((i) => i !== interest));
                      }}
                    />
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  Edit Interests
                </Button>
              </CardContent>
            </Card>

            {/* CV Re-upload */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-foreground mb-4">Update CV</h3>
                <FileUpload onFileSelect={(file) => console.log("New CV:", file)} />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
