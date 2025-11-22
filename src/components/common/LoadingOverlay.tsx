import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  title?: string;
  messages?: string[];
}

export const LoadingOverlay = ({
  isVisible,
  title = "Processing your profile...",
  messages = [
    "Uploading your CV...",
    "Extracting your information...",
    "Analyzing your experience...",
    "Building your profile...",
    "Almost there..."
  ]
}: LoadingOverlayProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 mx-4">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Animated spinner */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">{title}</h3>
              <div className="h-12 flex items-center justify-center">
                <p className="text-muted-foreground animate-pulse transition-opacity duration-300">
                  {messages[currentMessageIndex]}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="w-full space-y-2">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"
                  style={{
                    width: `${((currentMessageIndex + 1) / messages.length) * 100}%`,
                    transition: "width 0.5s ease-in-out"
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This usually takes 10-15 seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
