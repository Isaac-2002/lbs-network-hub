import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export const StatCard = ({ title, value, icon: Icon }: StatCardProps) => {
  return (
    <Card className="overflow-hidden relative group hover:scale-105 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <p className="text-4xl font-bold text-foreground mt-2 tracking-tight">{value}</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Icon className="h-7 w-7 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
