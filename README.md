# LBS Network Hub

An AI-powered networking platform connecting London Business School students and alumni based on career interests, industries, and professional goals.

**Repository**: https://lbs-network-hub.vercel.app/

## Overview

LBS Network Hub uses AI to match students and alumni for meaningful professional connections. Upload your CV, set your networking preferences, and receive personalized match recommendations powered by GPT-4o.

## Features

- **Smart Matching Algorithm**: AI-powered recommendations based on industries, goals, and backgrounds
- **CV Auto-Extraction**: Upload your CV and automatically populate your profile using OpenAI Assistants API
- **Personalized Recommendations**: Get 3 tailored matches with compatibility scores and connection reasons
- **User Authentication**: Secure sign-up with email or Google OAuth via Supabase Auth
- **Privacy Controls**: Choose to connect with students, alumni, or both
- **Profile Summaries**: Auto-generated professional summaries for efficient matching

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
**Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
**AI**: OpenAI GPT-4o (matching), OpenAI Assistants API v2 (CV extraction)
**Deployment**: Vercel (frontend), Supabase (backend)

## Quick Start

### Prerequisites

- Node.js 18+ & npm
- [Supabase account](https://supabase.com)
- [OpenAI API key](https://platform.openai.com/api-keys)

### Installation

```bash
# Clone repository
git clone https://github.com/Isaac-2002/lbs-network-hub.git
cd lbs-network-hub

# Install dependencies
npm install

# Set up environment variables
cp env.template .env
# Edit .env with your Supabase credentials
```

### Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Apply database migrations
supabase db push

# Set OpenAI API key
supabase secrets set OPENAI_API_KEY=sk-...

# Deploy edge functions
supabase functions deploy extract-cv-data
supabase functions deploy generate-recommendations
```

### Run Development Server

```bash
npm run dev
```

## Database Schema

- **profiles**: User data (identity, education, professional history, preferences)
- **profile_summaries**: AI-generated summaries for matching (JSONB)
- **matches**: Match recommendations with scores and personalized reasons
- **match_interactions**: User engagement tracking (viewed, contacted, declined)

## How Matching Works

1. **Upload CV**: AI extracts your professional background
2. **Set Preferences**: Choose networking goals and target industries
3. **Generate Matches**: Click "Generate Recommendations" on dashboard
4. **Rule-Based Filtering**: Respects mutual connection preferences
5. **AI Scoring**: GPT-4o analyzes all candidates and returns top 3 matches
6. **Connect**: Contact matches via email or LinkedIn

## Architecture

Feature-based layered architecture following SOLID principles:
- **Presentation Layer**: React components
- **Application Layer**: Custom hooks, services
- **Domain Layer**: Business models and types
- **Infrastructure Layer**: Repositories, API clients

See `CLAUDE.md` for detailed architecture documentation.

## License

Private project - All rights reserved
