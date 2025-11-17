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
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="text-sm font-semibold text-primary">✨ Connect with the LBS Network</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight">
              Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">LBS Network</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
              Connect with fellow students and alumni to expand your professional network. 
              Whether you're exploring career paths or giving back, we make meaningful introductions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
              <Button 
                size="lg" 
                className="text-lg flex-1"
                onClick={() => navigate("/onboarding/student")}
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                I'm a Current Student
              </Button>
              <Button 
                size="lg" 
                variant="accent"
                className="text-lg flex-1"
                onClick={() => navigate("/onboarding/alumni")}
              >
                <Users className="mr-2 h-5 w-5" />
                I'm an Alumni
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Smart Matching</h3>
                <p className="text-muted-foreground">
                  Our algorithm connects you with people who share your interests and career goals
                </p>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Weekly Connections</h3>
                <p className="text-muted-foreground">
                  Receive 3 curated matches every week delivered directly to your inbox
                </p>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-chart-3/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-chart-3" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">LBS Community</h3>
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
