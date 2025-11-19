// Match types for the matching feature

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  score: number;
  reason: string;
  status: MatchStatus;
  createdAt: Date;
  expiresAt?: Date;
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

export interface ProfileSummary {
  id: string;
  userId: string;
  summaryJson: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchCriteria {
  industries?: string[];
  userType?: 'student' | 'alumni';
  programs?: string[];
  minExperience?: number;
  maxExperience?: number;
}
