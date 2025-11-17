import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, FileText, Sparkles, Mail } from "lucide-react";

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
                I'm an Alumn
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="border-t border-border/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Tell us what you are looking for</h3>
                <p className="text-muted-foreground">
                  Complete a quick onboarding process to share your interests, career goals, and what you're seeking in your network
                </p>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Smart matching</h3>
                <p className="text-muted-foreground">
                  Our AI-powered matching algorithm analyzes your profile and preferences to find the most relevant connections
                </p>
              </div>
              
              <div className="text-center group">
                <div className="h-16 w-16 rounded-2xl bg-chart-3/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="h-8 w-8 text-chart-3" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Weekly connections</h3>
                <p className="text-muted-foreground">
                  Receive a weekly email with 3 carefully curated matches, making it easy to build meaningful relationships over time
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
