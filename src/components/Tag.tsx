import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  variant?: "default" | "selected";
}

export const Tag = ({ label, selected = false, onToggle, onRemove, variant }: TagProps) => {
  const isSelected = variant === "selected" || selected;
  
  return (
    <span
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        isSelected
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-primary/10",
        onToggle && "cursor-pointer"
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-destructive transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
};
