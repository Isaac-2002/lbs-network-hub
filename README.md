# LBS Network Hub

A networking platform for London Business School students and alumni to connect based on shared interests, industries, and career goals.

## Project info

**URL**: https://lovable.dev/projects/cc7c6646-361a-4874-9071-c8448494072c

## Features

- **User Authentication**: Secure sign-up and login via Supabase Auth
- **Role-Based Onboarding**: Separate flows for students and alumni
- **CV Upload & Auto-Extraction**: Upload CVs and automatically extract profile data using AI
- **Profile Management**: Comprehensive 26-field user profiles
- **Industry Matching**: Connect users based on target industries and networking goals
- **Privacy Controls**: Granular preferences for who can see your profile

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cc7c6646-361a-4874-9071-c8448494072c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
# Copy env.template to .env and fill in your Supabase credentials
cp env.template .env

# Step 5: Set up Supabase (database + edge functions)
# See SETUP_CV_EXTRACTION.md for detailed instructions

# Step 6: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

**Frontend:**
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Backend:**
- Supabase (Database, Auth, Storage, Edge Functions)
- PostgreSQL
- OpenAI GPT-4o (CV data extraction)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cc7c6646-361a-4874-9071-c8448494072c) and click on Share -> Publish.

## Setup Instructions

### Prerequisites

1. **Node.js & npm** - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
2. **Supabase Account** - [Sign up at supabase.com](https://supabase.com)
3. **OpenAI API Key** - [Get from OpenAI Platform](https://platform.openai.com/api-keys)
4. **Supabase CLI** - Install globally: `npm install -g supabase`

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <YOUR_GIT_URL>
   cd lbs-network-hub
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.template .env
   # Edit .env and add your Supabase credentials
   ```

3. **Set Up Supabase**
   - Follow the detailed guide in `SETUP_CV_EXTRACTION.md`
   - Deploy migrations: `supabase db push`
   - Set OpenAI key: `supabase secrets set OPENAI_API_KEY=sk-...`
   - Deploy functions: `supabase functions deploy extract-cv-data`

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### Documentation

- **[SETUP_CV_EXTRACTION.md](./SETUP_CV_EXTRACTION.md)** - Complete CV extraction setup guide
- **[supabase/DEPLOYMENT.md](./supabase/DEPLOYMENT.md)** - Supabase deployment instructions
- **[env.template](./env.template)** - Environment variables template

## Database Schema

The application uses a 26-column `profiles` table that stores:
- User authentication data (from Supabase Auth)
- User input from onboarding (networking goals, preferences)
- AI-extracted data from CVs (name, experience, education, etc.)

See migration: `supabase/migrations/20240103000000_update_profiles_table.sql`

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
