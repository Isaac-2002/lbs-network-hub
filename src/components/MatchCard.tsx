import { Mail, Linkedin, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag } from "./Tag";

interface MatchCardProps {
  name: string;
  title: string;
  tags: string[];
  sentDate: string;
  email?: string;
  linkedin?: string;
}

export const MatchCard = ({ name, title, tags, sentDate, email, linkedin }: MatchCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{title}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <Tag key={tag} label={tag} variant="selected" />
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Sent on {sentDate}</p>
              <div className="flex gap-2">
                {email && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`mailto:${email}`}>
                      <Mail className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                {linkedin && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
