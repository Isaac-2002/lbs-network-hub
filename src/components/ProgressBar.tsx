import { cn } from "@/lib/utils";

interface ProgressBarProps {
  steps: string[];
  currentStep: number;
}

export const ProgressBar = ({ steps, currentStep }: ProgressBarProps) => {
  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                index < currentStep
                  ? "bg-success text-success-foreground shadow-lg shadow-success/30"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-xs mt-3 text-center text-muted-foreground font-medium">{step}</span>
          </div>
        ))}
      </div>
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};
