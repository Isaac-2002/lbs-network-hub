# Purpose
Networking platform matching London Business School students and alumni based on career interests using AI.
Tech Stack

## Tech Stack
Frontend: React/Next.js on Vercel
Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
AI: OpenAI GPT-4o for CV extraction

##Database Schema
profiles table:

Identity: user_id, email
Personal: first_name, last_name, linkedin_url
Education: user_type (student/alumni), lbs_program (MAM/MIM/MBA/MFA), graduation_year, undergraduate_university
Professional: years_of_experience, current_role, current_company, current_location, languages[]
Preferences: networking_goal, target_industries[], specific_interests
Consent: connect_with_students, connect_with_alumni, send_weekly_updates
System: cv_path, onboarding_completed

##User Flow

1. Register with email
2. Select user type (student/alumni)
3. Upload CV (PDF only)
4. Fill interests form
5. Set consent preferences
6. Edge function extracts CV data via OpenAI and updates the profile table with extracted + user data

## CV Extraction (Edge Function)

Uploads PDF to OpenAI Assistants API
Extracts: name, LinkedIn, experience, education, languages, location, role, company
Updates profiles table
Returns JSON response

## Next steps
Once user profiles are populated with CV-extracted data and onboarding preferences, the system will generate profile summaries that combine career goals, target industries, professional background, and interests into structured JSON objects stored in a new table.

Each week, an automated matching process will run for users who have opted into weekly updates. For each user, the system will first apply rule-based filters to create a candidate pool. The filtered candidates' JSON profiles will then be sent to an LLM along with the user's profile and a detailed prompt containing our matching guidelines. The LLM will analyze the profiles, score their compatibility based on shared interests, complementary goals, and career alignment, then return the top 3 best matches with explanations for why each connection would be valuable. Finally, the system will generate personalized introduction email templates and send them to users with each match's LinkedIn URL and email address, enabling them to easily reach out and expand their professional network within the LBS community.

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
│   ├── matching/              # NEW - Matching feature (planned)
│   │   ├── components/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── MatchList.tsx
│   │   │   └── MatchFilters.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   └── Matches.tsx
│   │   ├── hooks/             # useMatches, useMatchFilters
│   │   ├── services/          # Matching business logic
│   │   │   ├── matchingService.ts      # Rule-based filtering
│   │   │   ├── scoringService.ts       # LLM-based scoring
│   │   │   └── profileSummaryService.ts
│   │   └── types.ts
│   │
│   ├── notifications/         # NEW - Email/notification feature (planned)
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   │   ├── emailService.ts
│   │   │   └── templateService.ts
│   │   └── types.ts
│   │
│   └── analytics/             # NEW - Future analytics feature
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
│   ├── extract-cv-data/      # CV extraction
│   │   ├── index.ts
│   │   └── types.ts
│   │
│   ├── generate-matches/      # NEW - Weekly matching cron
│   │   ├── index.ts
│   │   ├── matching/
│   │   │   ├── filters.ts    # Rule-based filtering
│   │   │   ├── scoring.ts    # LLM-based scoring
│   │   │   └── ranking.ts    # Match ranking
│   │   ├── profile/
│   │   │   └── summaryGenerator.ts
│   │   └── types.ts
│   │
│   ├── send-match-emails/     # NEW - Email generation and sending
│   │   ├── index.ts
│   │   ├── templates/
│   │   │   └── matchIntroduction.ts
│   │   └── types.ts
│   │
│   └── shared/               # Shared utilities for edge functions
│       ├── supabaseClient.ts
│       ├── openaiClient.ts
│       └── types.ts
│
└── migrations/               # Database migrations
    └── [timestamp]_*.sql
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

### Database Schema Extensions

To support the matching feature, additional tables are recommended:

```sql
-- Profile summaries (generated by LLM)
CREATE TABLE profile_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  summary_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  matched_user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  score DECIMAL(3,2) NOT NULL,  -- 0.00 to 1.00
  reason TEXT,                   -- LLM explanation
  status TEXT DEFAULT 'pending', -- pending, accepted, declined, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, matched_user_id)
);

-- Match interactions (for analytics)
CREATE TABLE match_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- viewed, contacted, declined
  interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,      -- match_notification, welcome, etc.
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent'     -- sent, failed, bounced
);
```

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

### Migration Path

To migrate from the current structure to this architecture:

1. **Phase 1: Create Infrastructure Layer** (Week 1)
   - Create repository interfaces and implementations
   - Abstract Supabase calls behind repositories
   - No UI changes, just refactoring

2. **Phase 2: Introduce Service Layer** (Week 2)
   - Create service classes for each feature
   - Move business logic from components to services
   - Update components to use services via hooks

3. **Phase 3: Feature-Based Organization** (Week 3)
   - Create feature folders
   - Move components, hooks, and services into features
   - Update imports across the application

4. **Phase 4: Add New Features** (Week 4+)
   - Implement matching feature using new architecture
   - Add profile summary generation
   - Implement email notifications

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