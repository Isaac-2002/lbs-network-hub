import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Target } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Build Your LBS Network
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed">
              Connect with fellow students and alumni to expand your professional network. 
              Whether you're a current student exploring career paths or an alumni looking to 
              give back, LBS Connect makes meaningful introductions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <Button 
                size="lg" 
                className="text-lg py-6 flex-1"
                onClick={() => navigate("/onboarding/student")}
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                I'm a Current Student
              </Button>
              <Button 
                size="lg" 
                variant="default"
                className="text-lg py-6 flex-1 bg-accent hover:bg-accent/90"
                onClick={() => navigate("/onboarding/alumni")}
              >
                <Users className="mr-2 h-5 w-5" />
                I'm an Alumni
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Smart Matching</h3>
                <p className="text-muted-foreground">
                  Our algorithm connects you with people who share your interests and career goals
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Weekly Connections</h3>
                <p className="text-muted-foreground">
                  Receive 3 curated matches every week delivered directly to your inbox
                </p>
              </div>
              
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">LBS Community</h3>
                <p className="text-muted-foreground">
                  Connect exclusively within the trusted London Business School network
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
