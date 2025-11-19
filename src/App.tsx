import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/features/auth";
import Index from "./pages/Index";
import { StudentOnboarding, AlumniOnboarding } from "@/features/onboarding";
import Welcome from "./pages/Welcome";
import { Dashboard, Matches } from "@/features/matching";
import { Profile, Settings } from "@/features/profile";
import UpdateStatus from "./pages/UpdateStatus";
import NotFound from "./pages/NotFound";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const queryClient = new QueryClient();

const AuthErrorBanner = () => {
  const { authError, resendConfirmation, clearAuthError } = useAuth();
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!authError) return null;

  const handleResend = async () => {
    if (!resendEmail) {
      // Try to extract email from error message or prompt user
      const email = prompt("Please enter your email address to resend the confirmation email:");
      if (!email) return;
      setResendEmail(email);
    }

    setResendLoading(true);
    setResendSuccess(false);
    const { error } = await resendConfirmation(resendEmail);
    setResendLoading(false);
    
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setResendSuccess(true);
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <Alert variant="destructive" className="relative">
        <div className="absolute right-2 top-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={clearAuthError}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <AlertTitle>Email Confirmation Error</AlertTitle>
        <AlertDescription className="mt-2 pr-8">
          {authError}
          {authError && (authError.includes("expired") || authError.includes("invalid")) ? (
            <div className="mt-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full sm:w-auto"
              >
                <Mail className="h-4 w-4 mr-2" />
                {resendLoading ? "Sending..." : resendSuccess ? "Email Sent!" : "Resend Confirmation Email"}
              </Button>
              {resendSuccess && (
                <span className="text-sm text-muted-foreground">
                  Check your email for a new confirmation link.
                </span>
              )}
            </div>
          ) : null}
        </AlertDescription>
      </Alert>
    </div>
  );
};

const AppContent = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthErrorBanner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/onboarding/student" element={<StudentOnboarding />} />
        <Route path="/onboarding/alumni" element={<AlumniOnboarding />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/matches" element={<Matches />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/update-status" element={<UpdateStatus />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
