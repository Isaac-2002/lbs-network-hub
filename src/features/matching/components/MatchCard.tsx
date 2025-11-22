import { Mail, User } from "lucide-react";
import { LinkedinIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatchCardProps {
  firstName: string;
  lastName: string;
  email: string;
  linkedin: string | null;
  lbsProgram: string | null;
  graduationYear: number | null;
  reason: string | null;
}

export const MatchCard = ({
  firstName,
  lastName,
  email,
  linkedin,
  lbsProgram,
  graduationYear,
  reason,
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
            <h3 className="font-bold text-lg text-foreground mb-2">{fullName}</h3>
            <Badge variant="secondary" className="text-xs">
              {programInfo}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {reason && (
          <p className="text-sm text-muted-foreground italic">{reason}</p>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={`mailto:${email}`} title="Send email">
              <Mail className="h-4 w-4" />
            </a>
          </Button>
          {linkedin && (
            <Button size="sm" variant="outline" asChild>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" title="View LinkedIn profile">
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
