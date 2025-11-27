# LBS Network Hub

## Purpose
Networking platform matching London Business School students and alumni based on career interests using AI.

## Quick Status Overview
**✅ Core Features Implemented**:
- User authentication and onboarding
- CV upload and AI-powered data extraction (OpenAI Assistants API)
- Automatic profile summary generation
- Automated match recommendations (GPT-4o) - triggered on onboarding and profile updates
- Email notifications with personalized connection messages (GPT-4o-mini)
- Dashboard with match display and contact functionality

**📋 Planned Features**:
- Weekly automated match generation (cron job)
- Accept/decline match workflow
- Match analytics and success tracking

## Tech Stack
**Frontend**: React 18 + TypeScript + Vite (deployed on Vercel)
**Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions - Deno)
**AI**:
- OpenAI Assistants API v2 (CV extraction)
- OpenAI GPT-4o (match scoring and personalization)
**State Management**: React Query + Context API
**UI Components**: shadcn/ui + Tailwind CSS
**Architecture**: Feature-based layered architecture with service/repository patterns

## Database Schema

### profiles table (26 columns):

**Identity**: user_id, email, id
**Personal**: first_name, last_name, linkedin_url
**Education**: user_type (student/alumni), lbs_program (MAM/MIM/MBA/MFA), graduation_year, undergraduate_university
**Professional**: years_of_experience, current_role, current_company, current_location, languages[], work_history[]
**Preferences**: networking_goal, target_industries[], specific_interests
**Consent**: connect_with_students, connect_with_alumni, send_weekly_updates
**System**: cv_path, cv_uploaded_at, onboarding_completed, created_at, updated_at

### profile_summaries table:
- id: UUID (primary key)
- user_id: UUID (unique, references profiles)
- summary_json: JSONB (contains structured profile data for matching)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

### matches table:
- id: UUID (primary key)
- user_id: UUID (the person requesting matches)
- matched_user_id: UUID (the recommended person)
- score: DECIMAL(3,2) (compatibility score 0.00 to 1.00)
- reason: TEXT (personalized LLM-generated match explanation)
- status: TEXT ('pending', 'accepted', 'declined', 'expired')
- created_at: TIMESTAMP
- expires_at: TIMESTAMP (nullable)

### match_interactions table:
- id: UUID (primary key)
- match_id: UUID (references matches)
- interaction_type: TEXT ('viewed', 'contacted', 'declined')
- interaction_date: TIMESTAMP

### email_logs table:
- id: UUID (primary key)
- user_id: UUID (references profiles)
- email_type: TEXT ('match_notification', 'welcome', etc.)
- sent_at: TIMESTAMP
- status: TEXT ('sent', 'failed', 'bounced')

## User Flow

1. **Register** with email via Supabase Auth
2. **Select user type** (student/alumni)
3. **Upload CV** (PDF only, max 1MB)
4. **Fill interests form** (networking goal, target industries, specific interests)
5. **Set consent preferences** (connect with students/alumni, weekly updates)
6. **Automated Processing** (during onboarding):
   - Edge function extracts CV data via OpenAI Assistants API
   - Updates profiles table with extracted fields
   - Generates and stores profile summary in profile_summaries table
   - **Automatically generates top 3 match recommendations**
   - **Generates personalized LinkedIn cold messages for each match**
   - **Sends email with matches and suggested messages**
7. **Dashboard**:
   - View current profile summary
   - View personalized match recommendations
   - Access matches via email or LinkedIn
8. **Profile Updates**:
   - Update profile via "Update Your Status" button
   - Matches are automatically regenerated after updates
   - New email sent with updated recommendations

## CV Extraction & Profile Summary (Edge Function: extract-cv-data)

**Process**:
1. Downloads PDF from Supabase Storage
2. Uploads to OpenAI Files API
3. Creates OpenAI Assistant with file_search capability
4. Runs assistant to extract structured data from CV
5. **Extracts**: name, LinkedIn URL, years of experience, education, languages, current role/company/location, LBS program, graduation year, work history
6. Updates profiles table with extracted fields
7. **Generates profile summary** combining CV data + user onboarding input
8. Stores profile summary in profile_summaries table (JSONB format)
9. Returns success response with extracted data

## Matching Algorithm (Edge Function: generate-recommendations)

**Status**: ✅ Fully Implemented

The matching system uses a **two-tier approach** combining rule-based filtering and LLM-based scoring:

### Tier 1: Rule-Based Filtering
The edge function applies pre-filtering to create a candidate pool:
- Only includes users with `onboarding_completed = true`
- Respects mutual preferences (both users must be willing to connect with each other's type)
- Filters based on `connect_with_students` and `connect_with_alumni` flags
- Excludes the requesting user

### Tier 2: LLM-Based Scoring (GPT-4o)
After filtering, GPT-4o analyzes all candidate profiles to provide personalized match recommendations:

**Evaluation Criteria** (5 factors):
1. **Shared Industries**: Overlap in target industries
2. **Complementary Goals**: Alignment of networking objectives
3. **Common Background**: Same university, similar experience level, shared interests
4. **LBS Connection**: Same or complementary LBS programs
5. **Mutual Benefit**: How both parties would benefit from connecting

**Output**: Top 3 matches with:
- Compatibility score (0.00 to 1.00)
- Personalized 2-3 sentence explanation of why they should connect
- Status set to 'pending'

**Process Flow**:
```
User completes onboarding OR updates profile/settings
    ↓
1. Fetch user profile + summary
2. Apply rule-based filters → candidate pool
3. Fetch candidate profile summaries
4. Construct detailed prompt with all profiles
5. Send to GPT-4o for analysis (temperature: 0.7)
6. Parse JSON response (validates format)
7. Delete old pending matches
8. Insert new matches with scores + reasons
9. Generate personalized LinkedIn messages (GPT-4o-mini)
10. Send email with matches and suggested messages
    ↓
User receives email + Dashboard displays matches
```

**Triggers for Automatic Match Generation**:
- **Initial Onboarding**: After CV extraction completes
- **Profile Update**: When user re-completes onboarding via "Update Your Status"
- **Settings Change**: When user updates connection preferences (connect_with_students/alumni)

**Frontend Implementation**:
- `Dashboard.tsx`: Shows profile summary and match recommendations (loaded automatically)
- `MatchCard.tsx`: Displays match with avatar, details, compatibility score, LLM-generated reason, email/LinkedIn buttons
- `useMatches` hook: Fetches and caches matches via React Query
- `useGenerateRecommendationsAndSendEmail` hook: Chains match generation + email sending
- `MatchingService` + `MatchRepository`: Service layer for business logic and data access

**Performance**: 10-20 seconds per generation (including email)
**Cost**: ~$0.03-0.07 per recommendation request (GPT-4o + GPT-4o-mini for cold messages)

### Profile Summary Structure
Profile summaries are stored in JSONB format and contain:
```json
{
  "networking_goal": "Find mentors in private equity",
  "target_industries": ["Finance", "Private Equity", "Venture Capital"],
  "specific_interests": "Impact investing, ESG frameworks",
  "work_history": [
    {
      "role": "Investment Analyst",
      "company": "Goldman Sachs",
      "years": "2020-2022"
    }
  ],
  "education_summary": "BSc Economics from LSE",
  "languages": ["English", "French", "Spanish"],
  "lbs_program": "MAM",
  "graduation_year": 2024,
  "user_type": "student",
  "match_preferences": {
    "connect_with_students": true,
    "connect_with_alumni": true
  }
}
```

This structured summary enables efficient matching by providing the LLM with concise, relevant information about each candidate without needing to process full CVs.

## Edge Functions Implementation

### 1. extract-cv-data (✅ Implemented)
**Location**: `/supabase/functions/extract-cv-data/index.ts`

**Triggers**: Called after user uploads CV during onboarding

**Process**:
1. Downloads PDF from Supabase Storage bucket
2. Uploads to OpenAI Files API
3. Creates Assistant with `file_search` capability
4. Runs assistant with extraction prompt
5. Parses JSON response containing:
   - Personal: first_name, last_name, linkedin_url
   - Professional: years_of_experience, current_role, current_company, current_location
   - Education: undergraduate_university, languages[]
   - Work history: Array of {role, company, years}
6. Updates `profiles` table with extracted data
7. **Generates profile summary** by combining:
   - CV extracted data (work history, education, skills)
   - User onboarding input (networking_goal, target_industries, specific_interests)
8. Upserts to `profile_summaries` table (JSONB format)
9. Cleans up: deletes temporary OpenAI file
10. Returns extracted data to frontend

**Key Features**:
- Handles malformed JSON gracefully with validation
- Cleans extracted data (removes null/undefined values)
- Builds comprehensive profile summary for matching
- Error handling for OpenAI API failures

### 2. generate-recommendations (✅ Implemented)
**Location**: `/supabase/functions/generate-recommendations/index.ts`

**Triggers**:
- Automatically after CV extraction during onboarding
- After user updates profile via "Update Your Status"
- After user changes connection preferences in Settings

**Process**:
1. **Fetch user data**:
   - Get user's profile from `profiles` table
   - Get user's profile summary from `profile_summaries` table

2. **Rule-based filtering**:
   ```sql
   -- Get all completed profiles except the user
   WHERE onboarding_completed = true
     AND user_id != requesting_user_id

   -- Filter by user's preferences
   AND (
     (user.user_type = 'student' AND candidate.connect_with_students = true)
     OR
     (user.user_type = 'alumni' AND candidate.connect_with_alumni = true)
   )

   -- Filter by candidate's preferences
   AND (
     (candidate.user_type = 'student' AND user.connect_with_students = true)
     OR
     (candidate.user_type = 'alumni' AND user.connect_with_alumni = true)
   )
   ```

3. **Fetch candidate summaries**: Get profile_summaries for all filtered candidates

4. **Construct LLM prompt**:
   - User's complete profile + summary
   - All candidate profiles + summaries
   - Detailed matching criteria (5 factors)
   - Instructions to return top 3 with scores and reasons
   - JSON schema for response format

5. **Call OpenAI GPT-4o**:
   - Model: gpt-4o
   - Temperature: 0.7 (balanced creativity)
   - Max tokens: 2000
   - JSON mode enabled

6. **Parse and validate response**:
   - Validates JSON structure
   - Ensures 3 matches returned
   - Validates score range (0.0-1.0)
   - Checks for required fields

7. **Database operations**:
   ```sql
   -- Delete old pending matches for this user
   DELETE FROM matches
   WHERE user_id = requesting_user_id
     AND status = 'pending';

   -- Insert new matches
   INSERT INTO matches (user_id, matched_user_id, score, reason, status)
   VALUES (...);
   ```

8. **Return enriched matches**: Joins matches with full profile data for display

**Key Features**:
- Two-tier filtering reduces LLM input size and cost
- Respects mutual preferences (bidirectional filtering)
- Validates LLM output to prevent malformed responses
- Replaces old pending matches (can be modified to keep history)
- Returns immediately usable data for frontend

### 3. send-match-email (✅ Implemented)
**Location**: `/supabase/functions/send-match-email/index.ts`

**Triggers**:
- Automatically called after match generation completes
- Sends email immediately with newly generated matches

**Process**:
1. **Receive match data**:
   - userId: The user to send matches to
   - matches: Array of generated matches with profile data

2. **Fetch user profile**:
   - Get user's name, email, and networking_goal from `profiles` table

3. **Generate personalized LinkedIn messages**:
   - For each match, call GPT-4o-mini to generate a warm, professional message
   - Model: gpt-4o-mini
   - Temperature: 0.8 (creative but professional)
   - Max tokens: 200 per message
   - Context includes: sender name, recipient name, match reason, networking goal
   - Fallback message if API fails

4. **Build email content**:
   - HTML template with dark theme matching brand
   - For each match:
     - Name, LBS program, graduation year
     - Match reason (LLM-generated explanation)
     - LinkedIn profile link
     - Personalized suggested message in highlighted box
   - Plain text version for email clients

5. **Send email via Resend API**:
   - From: `LBS Connect <configured-email>`
   - Subject: "New networking matches found for you!"
   - Beautiful HTML email with match cards
   - Returns early if no matches (success=true, no email sent)

6. **Log email**:
   - Insert record into `email_logs` table
   - email_type: 'match_notification'
   - status: 'sent'

**Key Features**:
- AI-generated personalized cold messages for each match
- Professional email template with brand styling
- Graceful fallback if message generation fails
- Logs all emails for tracking and debugging
- Handles empty match arrays without sending email
- Uses Resend API for reliable delivery

**Email Template**:
- Dark theme (#1a1a1a background, #c1e649 accent)
- Match cards with profile details
- Clickable LinkedIn links
- Suggested messages in highlighted boxes
- Responsive design for mobile/desktop

**Performance**: 3-5 seconds for 3 matches (includes AI message generation)
**Cost**: ~$0.01-0.02 per email (GPT-4o-mini for 3 messages)

### 4. Shared utilities (✅ Implemented)
**Location**: `/supabase/functions/shared/`

- `supabaseClient.ts`: Creates Supabase client with service role key
- `openaiClient.ts`: OpenAI API client configuration
- `types.ts`: Shared TypeScript types across edge functions

## Current Status & Next Steps

### ✅ Implemented Features:
- CV extraction and parsing via OpenAI Assistants API
- Automatic profile summary generation during onboarding
- Rule-based candidate filtering
- LLM-based match scoring and ranking (GPT-4o)
- Match storage with scores and personalized reasons
- **Automated match generation** (triggers: onboarding, profile updates, settings changes)
- **Email notifications with AI-generated LinkedIn messages** (GPT-4o-mini)
- Email logging to `email_logs` table
- Dashboard UI with automatic match display
- Match display cards with contact buttons (email/LinkedIn)
- Row-Level Security (RLS) policies on all tables

### 🚧 Partially Implemented:
- Match interactions tracking (infrastructure exists, analytics not built)

### 📋 Planned Features:
- **Weekly Cron Job**: Automated batch processing for users with `send_weekly_updates = true`
- **Accept/Decline Workflow**: Allow users to accept or decline matches with status updates
- **Match Expiry Logic**: Automatically expire matches after a certain period
- **Match Analytics**: Track match success rates, user engagement, connection outcomes
- **Advanced Filtering**: Allow users to refine preferences (e.g., graduation year ranges, specific companies)
- **Connection Tracking**: Monitor which matches led to successful connections

---

## Application Architecture

### Architecture Philosophy

The application follows a **feature-based, layered architecture** that emphasizes:
- **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
- **SOLID Principles**: Single responsibility, dependency inversion, and interface segregation
- **Scalability**: Modular structure that supports adding new features without modifying existing code
- **Maintainability**: Logical organization that makes navigation and debugging straightforward
- **Testability**: Isolated layers that can be tested independently

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                (React Components & Pages)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│              (Hooks, Contexts, Services)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│              (Business Logic & Models)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│         (API Clients, Storage, External Services)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
        ┌─────▼──────┐      ┌────▼─────┐
        │  Supabase  │      │  OpenAI  │
        │  Backend   │      │   APIs   │
        └────────────┘      └──────────┘
```

### Recommended Folder Structure

```
src/
├── assets/                     # Static assets (images, fonts, etc.)
│
├── components/                 # Shared/reusable components
│   ├── ui/                    # shadcn/ui components (no changes)
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── DashboardLayout.tsx
│   ├── common/                # Common reusable components
│   │   ├── FileUpload.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Tag.tsx
│   └── feedback/              # User feedback components
│       ├── AuthDialog.tsx
│       └── ErrorBanner.tsx
│
├── features/                   # Feature-based modules (NEW - key architectural change)
│   ├── auth/
│   │   ├── components/        # Auth-specific components
│   │   ├── hooks/             # useAuth, useAuthRedirect
│   │   ├── context/           # AuthContext
│   │   ├── services/          # Auth service layer
│   │   └── types.ts           # Auth-specific types
│   │
│   ├── onboarding/
│   │   ├── components/        # Onboarding form components
│   │   │   ├── CVUploadStep.tsx
│   │   │   ├── InterestsStep.tsx
│   │   │   └── ConsentStep.tsx
│   │   ├── pages/             # Onboarding pages
│   │   │   ├── StudentOnboarding.tsx
│   │   │   └── AlumniOnboarding.tsx
│   │   ├── hooks/             # useOnboarding, useCVUpload
│   │   ├── services/          # Onboarding business logic
│   │   └── types.ts
│   │
│   ├── profile/
│   │   ├── components/        # Profile display components
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── ProfileSummary.tsx
│   │   │   └── ProfileEditor.tsx
│   │   ├── pages/
│   │   │   ├── Profile.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/             # useProfile, useProfileUpdate
│   │   ├── services/          # Profile service
│   │   └── types.ts
│   │
│   ├── matching/              # ✅ IMPLEMENTED - Matching feature
│   │   ├── components/
│   │   │   ├── MatchCard.tsx              # ✅ Implemented
│   │   │   ├── MatchList.tsx              # Placeholder
│   │   │   └── MatchFilters.tsx           # Placeholder
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx              # ✅ Implemented (recommendations UI)
│   │   │   └── Matches.tsx                # Placeholder (mock data)
│   │   ├── hooks/
│   │   │   ├── useMatches.ts              # ✅ Implemented
│   │   │   ├── useGenerateRecommendations.ts  # ✅ Implemented
│   │   │   └── useGenerateRecommendationsAndSendEmail.ts  # ✅ Implemented
│   │   ├── services/
│   │   │   ├── matchingService.ts         # ✅ Implemented
│   │   │   └── matchRepository.ts         # ✅ Implemented
│   │   └── types.ts
│   │
│   ├── notifications/         # 📋 PLANNED - Email/notification feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── emailService.ts
│   │   │   └── templateService.ts
│   │   └── types.ts
│   │
│   └── analytics/             # 📋 PLANNED - Future analytics feature
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── types.ts
│
├── lib/                        # Shared utilities and configurations
│   ├── api/                   # API clients and configuration
│   │   ├── supabase.ts       # Supabase client
│   │   ├── openai.ts         # OpenAI client (if needed on frontend)
│   │   └── apiClient.ts      # Generic API utilities
│   ├── utils/                # Utility functions
│   │   ├── validation.ts     # Form validation helpers
│   │   ├── formatting.ts     # Data formatting helpers
│   │   └── date.ts           # Date utilities
│   ├── constants/            # Application constants
│   │   ├── routes.ts         # Route constants
│   │   ├── industries.ts     # Industry options
│   │   └── programs.ts       # LBS program options
│   ├── types/                # Shared types (domain models)
│   │   ├── profile.ts        # Profile types
│   │   ├── match.ts          # Match types
│   │   └── common.ts         # Common types
│   └── hooks/                # Shared custom hooks
│       ├── useDebounce.ts
│       ├── useLocalStorage.ts
│       └── useAsync.ts
│
├── pages/                     # Top-level route pages (simplified)
│   ├── Index.tsx             # Landing page
│   ├── Welcome.tsx           # Welcome page
│   └── NotFound.tsx          # 404 page
│
├── routing/                   # Routing configuration
│   ├── AppRouter.tsx         # Main router component
│   ├── ProtectedRoute.tsx    # Auth guard
│   └── routes.config.ts      # Route definitions
│
├── styles/                    # Global styles
│   ├── index.css
│   └── theme.css
│
├── App.tsx                    # Root component
├── main.tsx                   # Entry point
└── vite-env.d.ts             # Vite types

supabase/
├── functions/                 # Edge Functions (Deno)
│   ├── extract-cv-data/      # ✅ IMPLEMENTED - CV extraction + profile summary
│   │   └── index.ts          # Extracts CV data & generates profile summaries
│   │
│   ├── generate-recommendations/  # ✅ IMPLEMENTED - On-demand matching
│   │   └── index.ts          # Rule-based filtering + GPT-4o scoring
│   │
│   ├── generate-matches/      # 📋 PLANNED - Weekly matching cron job
│   │   ├── index.ts
│   │   ├── matching/
│   │   │   ├── filters.ts
│   │   │   └── scoring.ts
│   │   └── types.ts
│   │
│   ├── send-match-email/      # ✅ IMPLEMENTED - Email generation and sending
│   │   └── index.ts           # Generates AI messages and sends via Resend
│   │
│   └── shared/               # ✅ Shared utilities for edge functions
│       ├── supabaseClient.ts
│       ├── openaiClient.ts
│       └── types.ts
│
└── migrations/               # Database migrations
    ├── 20240101000000_create_profiles_table.sql
    ├── 20240101000001_create_cv_storage_bucket.sql
    ├── 20240102000000_fix_profile_trigger.sql
    ├── 20240103000000_update_profiles_table.sql
    ├── 20250119000000_create_matching_tables.sql          # ✅ Implemented
    ├── 20250119100000_recreate_profile_summaries.sql     # ✅ Implemented
    └── 20250120000000_add_work_history_to_profiles.sql   # ✅ Implemented
```

### Layer Responsibilities

#### 1. Presentation Layer (Components & Pages)
**Responsibility**: Display UI, handle user interactions, delegate to application layer

**Principles**:
- Components should be "dumb" - focused on presentation
- No direct API calls or business logic
- Receive data via props or hooks
- Emit events/callbacks for user actions

**Example**:
```typescript
// features/matching/components/MatchCard.tsx
export const MatchCard = ({ match, onConnect }: MatchCardProps) => {
  // Pure presentation - no business logic
  return (
    <Card>
      <CardHeader>{match.name}</CardHeader>
      <CardContent>{match.title}</CardContent>
      <Button onClick={() => onConnect(match.id)}>Connect</Button>
    </Card>
  );
};
```

#### 2. Application Layer (Hooks & Services)
**Responsibility**: Orchestrate business logic, manage state, coordinate between layers

**Custom Hooks**: Encapsulate feature-specific logic and state
```typescript
// features/matching/hooks/useMatches.ts
export const useMatches = (userId: string) => {
  // Coordinates between service layer and components
  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', userId],
    queryFn: () => matchingService.getUserMatches(userId)
  });

  const handleConnect = useMutation({
    mutationFn: (matchId: string) => matchingService.connectWithMatch(matchId)
  });

  return { matches: data, isLoading, error, connectWithMatch: handleConnect };
};
```

**Services**: Implement business logic, coordinate with infrastructure
```typescript
// features/matching/services/matchingService.ts
export class MatchingService {
  constructor(
    private profileRepo: ProfileRepository,
    private matchRepo: MatchRepository
  ) {}

  async getUserMatches(userId: string): Promise<Match[]> {
    // Business logic: filter, sort, transform
    const profile = await this.profileRepo.findById(userId);
    const candidates = await this.profileRepo.findCandidates(profile);
    return this.matchRepo.findMatchesForUser(userId, candidates);
  }

  async connectWithMatch(userId: string, matchId: string): Promise<void> {
    // Business logic for initiating connection
    await this.matchRepo.createConnection(userId, matchId);
    // Could trigger email notification
  }
}
```

#### 3. Domain Layer (Business Models & Types)
**Responsibility**: Define core business entities and rules

```typescript
// lib/types/match.ts
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  score: number;
  reason: string;
  status: MatchStatus;
  createdAt: Date;
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

// Domain logic
export class MatchEntity {
  constructor(private match: Match) {}

  canAccept(): boolean {
    return this.match.status === MatchStatus.PENDING &&
           !this.isExpired();
  }

  private isExpired(): boolean {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.match.createdAt < weekAgo;
  }
}
```

#### 4. Infrastructure Layer (API Clients & Repositories)
**Responsibility**: Handle external communication, data persistence

**Repository Pattern**: Abstract data access
```typescript
// features/profile/services/profileRepository.ts
export interface IProfileRepository {
  findById(userId: string): Promise<Profile | null>;
  findCandidates(criteria: ProfileCriteria): Promise<Profile[]>;
  update(userId: string, data: Partial<Profile>): Promise<void>;
}

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw new RepositoryError(error.message);
    return data ? this.mapToProfile(data) : null;
  }

  async findCandidates(criteria: ProfileCriteria): Promise<Profile[]> {
    // Complex query logic isolated here
    let query = this.supabase.from('profiles').select('*');

    if (criteria.industries?.length) {
      query = query.overlaps('target_industries', criteria.industries);
    }

    if (criteria.userType) {
      query = query.eq('user_type', criteria.userType);
    }

    const { data, error } = await query;
    if (error) throw new RepositoryError(error.message);
    return data.map(this.mapToProfile);
  }

  private mapToProfile(row: any): Profile {
    // Transform database row to domain model
    return { ...row, createdAt: new Date(row.created_at) };
  }
}
```

### Key Architectural Decisions

#### 1. Feature-Based Organization
**Decision**: Organize code by feature, not by technical layer

**Rationale**:
- Improves maintainability by co-locating related code
- Makes it easier to understand and modify features in isolation
- Supports team scalability (different teams can own different features)
- Reduces coupling between features

**Trade-off**: Slightly more complex initial setup, but better long-term scalability

#### 2. Service Layer Pattern
**Decision**: Introduce a service layer between components and data access

**Rationale**:
- Separates business logic from UI concerns
- Makes business logic reusable across different components
- Enables easier testing (mock services instead of API calls)
- Provides a clear place for complex operations (e.g., matching algorithm)

**Example Use Case**: Matching service can be used by both the Dashboard page and the Matches page without duplicating logic

#### 3. Repository Pattern
**Decision**: Abstract data access behind repository interfaces

**Rationale**:
- Decouples business logic from Supabase implementation
- Makes it possible to switch databases or add caching without changing business logic
- Isolates complex query logic in one place
- Improves testability (easy to mock repositories)

#### 4. Custom Hooks for State Management
**Decision**: Use custom hooks to expose feature functionality to components

**Rationale**:
- Follows React best practices
- Encapsulates state management and side effects
- Provides a clean API for components
- Works well with React Query for data fetching and caching

#### 5. Dependency Injection via Constructors
**Decision**: Pass dependencies explicitly to services and repositories

**Rationale**:
- Makes dependencies explicit and visible
- Improves testability (easy to inject mocks)
- Follows SOLID's Dependency Inversion Principle
- Enables flexible composition of services

### Integration Patterns

#### Frontend-to-Backend Communication

```typescript
// 1. Component uses hook
const MatchesPage = () => {
  const { matches, isLoading } = useMatches(userId);
  return <MatchList matches={matches} />;
};

// 2. Hook uses service
const useMatches = (userId: string) => {
  return useQuery({
    queryKey: ['matches', userId],
    queryFn: () => matchingService.getUserMatches(userId)
  });
};

// 3. Service uses repository
class MatchingService {
  async getUserMatches(userId: string) {
    const profile = await profileRepository.findById(userId);
    return matchRepository.findMatchesForUser(userId);
  }
}

// 4. Repository calls Supabase
class SupabaseMatchRepository {
  async findMatchesForUser(userId: string) {
    return supabase.from('matches').select('*').eq('user_id', userId);
  }
}
```

#### Edge Function Communication

```typescript
// Frontend calls edge function
const extractCVData = async (userId: string, cvPath: string) => {
  const { data } = await supabase.functions.invoke('extract-cv-data', {
    body: { userId, cvPath }
  });
  return data;
};

// Edge function structure (Deno)
serve(async (req) => {
  // 1. Parse request
  const { userId, cvPath } = await req.json();

  // 2. Business logic
  const cvData = await cvExtractionService.extractData(cvPath);

  // 3. Update database
  await profileRepository.update(userId, cvData);

  // 4. Return response
  return new Response(JSON.stringify({ success: true, data: cvData }));
});
```

#### Cron Jobs (Scheduled Matching)

```typescript
// supabase/functions/generate-matches/index.ts
serve(async (req) => {
  // Triggered weekly by cron

  // 1. Get all users who opted in
  const users = await profileRepository.findUsersWithWeeklyUpdates();

  // 2. For each user, generate matches
  for (const user of users) {
    // 2a. Apply rule-based filters
    const candidates = await matchingService.filterCandidates(user);

    // 2b. Generate profile summaries if needed
    const summaries = await profileSummaryService.generateSummaries(candidates);

    // 2c. Use LLM to score and rank
    const matches = await scoringService.scoreMatches(user, summaries);

    // 2d. Store matches
    await matchRepository.saveMatches(user.id, matches);

    // 2e. Trigger email
    await emailService.sendMatchNotification(user, matches);
  }

  return new Response(JSON.stringify({ processed: users.length }));
});
```

### Implemented Database Schema

The matching feature is supported by the following tables (✅ implemented):

```sql
-- Profile summaries (generated during CV extraction)
CREATE TABLE profile_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES profiles(user_id) ON DELETE CASCADE,
  summary_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches (stores top 3 recommendations per user)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  score DECIMAL(3,2) NOT NULL,  -- 0.00 to 1.00 compatibility score
  reason TEXT,                   -- Personalized LLM-generated explanation
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, matched_user_id)
);

-- Match interactions (infrastructure for future analytics)
CREATE TABLE match_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- viewed, contacted, declined
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs (infrastructure for future email notifications)
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,      -- match_notification, welcome, etc.
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent'     -- sent, failed, bounced
);
```

**Row-Level Security (RLS)**: All tables have RLS policies ensuring users can only access their own data.

### Security & Performance Considerations

#### Row-Level Security (RLS)
```sql
-- Users can only read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only see their own matches
CREATE POLICY "Users can read own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own match status
CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user_id);
```

#### Caching Strategy
- Use React Query for client-side caching (stale-while-revalidate)
- Cache profile summaries in database (regenerate weekly)
- Consider Redis for frequently accessed data in edge functions

#### Rate Limiting
- Limit CV extraction requests (expensive OpenAI API calls)
- Rate limit match generation to prevent abuse
- Implement exponential backoff for API retries

### Testing Strategy

```typescript
// Unit tests: Test business logic in isolation
describe('MatchingService', () => {
  it('should filter candidates by industries', async () => {
    const mockRepo = createMockProfileRepository();
    const service = new MatchingService(mockRepo);

    const candidates = await service.filterCandidates(userProfile);

    expect(candidates).toHaveLength(5);
    expect(candidates[0].target_industries).toContain('Finance');
  });
});

// Integration tests: Test feature workflows
describe('Matching workflow', () => {
  it('should generate and save matches for user', async () => {
    const user = await createTestUser();
    const matches = await matchingService.generateMatches(user.id);

    expect(matches).toHaveLength(3);

    const saved = await matchRepository.findMatchesForUser(user.id);
    expect(saved).toEqual(matches);
  });
});

// E2E tests: Test full user flows
describe('User can view matches', () => {
  it('should display matches on dashboard', async () => {
    await loginAsUser('test@example.com');
    await navigateTo('/dashboard');

    const matches = await screen.findByTestId('match-list');
    expect(matches).toBeInTheDocument();
  });
});
```

### Implementation Progress

The application has been developed following the layered, feature-based architecture:

1. **✅ Phase 1: Infrastructure Layer** (Completed)
   - Repository pattern implemented (ProfileRepository, MatchRepository)
   - Supabase calls abstracted behind repository interfaces
   - Shared API clients (supabaseClient, openaiClient)

2. **✅ Phase 2: Service Layer** (Completed)
   - Service classes created for each feature
   - Business logic separated from components (MatchingService, ProfileService)
   - Components consume services via custom hooks

3. **✅ Phase 3: Feature-Based Organization** (Completed)
   - Feature folders structured: auth/, onboarding/, profile/, matching/
   - Components, hooks, and services co-located by feature
   - Clear separation of concerns across layers

4. **✅ Phase 4: Core Matching Feature** (Completed)
   - Profile summary generation (automatic during onboarding)
   - On-demand match generation via edge function
   - LLM-based scoring with GPT-4o
   - Dashboard UI with MatchCard components
   - Contact buttons (email/LinkedIn)

5. **📋 Phase 5: Automation & Notifications** (Planned)
   - Weekly cron job for batch processing
   - Email notification system
   - Accept/decline workflow
   - Match analytics and insights

### Benefits of This Architecture

1. **Scalability**: New features can be added without touching existing code
2. **Maintainability**: Clear separation makes debugging easier
3. **Testability**: Each layer can be tested independently
4. **Team Collaboration**: Multiple developers can work on different features without conflicts
5. **Flexibility**: Easy to swap implementations (e.g., change database, add caching)
6. **Code Reusability**: Business logic can be reused across different parts of the app
7. **Performance**: Service layer enables caching and optimization opportunities
8. **Documentation**: Structure itself serves as documentation of the system

### Alternative Approaches Considered

1. **Monolithic Services**: Single service file for all features
   - **Rejected**: Doesn't scale well, becomes a "god object"

2. **Direct Supabase Calls from Components**: No abstraction layer
   - **Rejected**: Tight coupling, hard to test, logic duplication

3. **Redux for State Management**: Centralized state store
   - **Rejected**: Overkill for current needs, React Query + Context is sufficient

4. **Micro-frontends**: Separate apps for each feature
   - **Rejected**: Too complex for current scale, but could be future consideration

### Future Extensibility

This architecture supports future features:
- **Admin Dashboard**: New feature module with role-based access
- **Chat/Messaging**: Real-time communication between matched users
- **Analytics Dashboard**: Track matching success, user engagement
- **Mobile App**: Shared business logic via API, different presentation layer
- **Third-party Integrations**: Isolated in infrastructure layer
- **A/B Testing**: Service layer makes it easy to implement different algorithms