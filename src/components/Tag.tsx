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
        "inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
        isSelected
          ? "bg-primary/20 text-primary border border-primary/30"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/30",
        onToggle && "cursor-pointer hover:scale-105"
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
