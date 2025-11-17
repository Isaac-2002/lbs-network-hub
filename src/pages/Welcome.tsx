import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "@/components/Tag";

const Welcome = () => {
  const navigate = useNavigate();

  // Mock data - in real app this would come from state/API
  const profileData = {
    name: "John Doe",
    program: "MBA",
    interests: ["Finance", "Technology", "Consulting"],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header showAuth={false} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-4">You're all set!</h1>
            <p className="text-lg text-muted-foreground">
              We're analyzing your profile and finding the best matches for you. 
              Expect your first batch of connections in your inbox next Monday.
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Profile Summary</h2>
              <div className="space-y-4 text-left">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Name</p>
                  <p className="font-medium text-foreground">{profileData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Program</p>
                  <p className="font-medium text-foreground">{profileData.program}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Interests</p>
                  <div className="flex flex-wrap gap-2">
                    {profileData.interests.map((interest) => (
                      <Tag key={interest} label={interest} variant="selected" />
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Welcome;
