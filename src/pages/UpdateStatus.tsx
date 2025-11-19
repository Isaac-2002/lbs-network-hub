import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users } from "lucide-react";

const UpdateStatus = () => {
  const navigate = useNavigate();

  const handleStudentClick = () => {
    // Clear any existing onboarding data to restart from beginning
    localStorage.removeItem("userType");
    // Pass update=true query parameter to allow re-onboarding
    navigate("/onboarding/student?update=true");
  };

  const handleAlumniClick = () => {
    // Clear any existing onboarding data to restart from beginning
    localStorage.removeItem("userType");
    // Pass update=true query parameter to allow re-onboarding
    navigate("/onboarding/alumni?update=true");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
            Build Your <span className="text-primary">LBS Network</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Connect with fellow students and alumni to expand your professional network. 
            Whether you're exploring career paths or giving back, we make meaningful introductions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <Button 
              size="lg" 
              className="text-lg flex-1"
              onClick={handleStudentClick}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              I'm a Current Student
            </Button>
            <Button 
              size="lg" 
              variant="accent"
              className="text-lg flex-1"
              onClick={handleAlumniClick}
            >
              <Users className="mr-2 h-5 w-5" />
              I'm an Alumni
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateStatus;

