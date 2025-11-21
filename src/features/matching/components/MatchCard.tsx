import { Mail, Linkedin, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  firstName: string;
  lastName: string;
  email: string;
  linkedin: string | null;
  role: string | null;
  lbsProgram: string | null;
  graduationYear: number | null;
  reason: string;
  score?: number;
}

export const MatchCard = ({
  firstName,
  lastName,
  email,
  linkedin,
  role,
  lbsProgram,
  graduationYear,
  reason,
  score
}: MatchCardProps) => {
  const fullName = `${firstName} ${lastName}`;
  const programInfo = lbsProgram && graduationYear
    ? `${lbsProgram} ${graduationYear}`
    : lbsProgram || "LBS Alumni";

  return (
    <Card className="hover:scale-105 transition-all duration-300 group overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-background" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-foreground mb-1">{fullName}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {role || "LBS Network Member"}
            </p>
            <Badge variant="secondary" className="text-xs">
              {programInfo}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">Why connect:</p>
          <p className="text-sm text-foreground leading-relaxed">{reason}</p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          {score !== undefined && (
            <Badge variant="outline" className="text-xs">
              Match: {(score * 100).toFixed(0)}%
            </Badge>
          )}
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" asChild>
              <a href={`mailto:${email}`} title="Send email">
                <Mail className="h-4 w-4" />
              </a>
            </Button>
            {linkedin && (
              <Button size="sm" variant="outline" asChild>
                <a href={linkedin} target="_blank" rel="noopener noreferrer" title="View LinkedIn profile">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
