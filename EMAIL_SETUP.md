# Email Notification Setup Guide

## Overview

The LBS Network Hub now sends automated email notifications when new matches are found. This guide explains how to configure the email service.

## Email Service Provider: Resend

We use [Resend](https://resend.com) for sending transactional emails because:
- Simple API and great developer experience
- Built for transactional emails (match notifications)
- Free tier: 3,000 emails/month, 100 emails/day
- Easy domain verification
- Good deliverability rates

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com/signup](https://resend.com/signup)
2. Sign up with your email
3. Verify your email address

### 2. Get Your API Key

1. Go to [API Keys](https://resend.com/api-keys) in your Resend dashboard
2. Click "Create API Key"
3. Name it: `LBS Network Hub - Production`
4. Select permissions: "Sending access"
5. Copy the API key (starts with `re_`)

### 3. Configure Domain (Optional but Recommended)

**For Testing (Free):**
- Resend provides `onboarding@resend.dev` for testing
- Emails will be sent from this address
- **Important:** Update the `from` field in the email function

**For Production:**
1. Go to [Domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain (e.g., `lbsconnect.com`)
4. Follow DNS verification steps
5. Update the edge function `from` address to use your domain

### 4. Add API Key to Supabase

Run this command to set the Resend API key as a Supabase secret:

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Verify it was set:

```bash
supabase secrets list
```

### 5. Update Email "From" Address

If using a custom domain, update the `from` field in the email function:

**File:** `/supabase/functions/send-match-email/index.ts`

```typescript
// Line ~140
from: "LBS Connect <noreply@lbsconnect.com>", // Change to your domain
```

Then redeploy:

```bash
supabase functions deploy send-match-email
```

## Email Flow

1. User clicks "Generate Recommendations"
2. `generate-recommendations` function:
   - Filters candidates based on preferences
   - Uses GPT-4o to score and rank matches
   - Stores top 3 matches in database
   - Triggers `send-match-email` function
3. `send-match-email` function:
   - Generates personalized cold-message drafts using GPT-4o-mini
   - Sends HTML email via Resend
   - Logs email in `email_logs` table
4. User receives email with:
   - Match names and programs
   - LinkedIn profile links
   - AI-generated cold-message suggestions
   - Match reasons (short sentence)

## Email Template Preview

```
Hi Isaac,

We just found someone who you might be interested in talking to:

┌─────────────────────────────────────────────────┐
│ Akshat Mittal, MAM 2025                         │
│ Shared interest in product management mentorship│
│ View LinkedIn Profile →                         │
│                                                 │
│ Suggested message:                              │
│ Hi Akshat, I noticed we're both in the LBS MAM │
│ program and share an interest in product        │
│ management. I'd love to learn about your        │
│ consulting experience. Would you be open to a   │
│ quick coffee chat?                              │
└─────────────────────────────────────────────────┘

Best,
The LBS Connect Team
```

## Testing

### Test Email Sending

You can test the email function directly:

```bash
supabase functions invoke send-match-email --body '{
  "userId": "your-user-id",
  "matches": [
    {
      "matched_user_id": "test-id",
      "first_name": "John",
      "last_name": "Doe",
      "lbs_program": "MAM",
      "graduation_year": 2025,
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "current_role": "Product Manager",
      "reason": "Shared interest in tech startups",
      "networking_goal": "Finding mentors"
    }
  ]
}'
```

### Check Email Logs

Query the database to see sent emails:

```sql
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

## Troubleshooting

### Email Not Sending

1. **Check API Key:**
   ```bash
   supabase secrets list
   ```
   Ensure `RESEND_API_KEY` is set

2. **Check Function Logs:**
   ```bash
   supabase functions logs send-match-email
   ```

3. **Verify Email Address:**
   - Using `onboarding@resend.dev`? Only works for testing
   - Custom domain? Check DNS verification status

### Email Goes to Spam

1. **Verify Domain:** Complete SPF, DKIM, DMARC setup in Resend
2. **Warm Up Domain:** Start with low volume, gradually increase
3. **Check Content:** Avoid spam trigger words, balanced text/link ratio

### Rate Limits

Resend Free Tier Limits:
- 3,000 emails/month
- 100 emails/day

If exceeded:
- Upgrade to paid plan ($20/month for 50k emails)
- Or implement queuing/batching for weekly emails

## Cost Estimates

**Resend:**
- Free: 3,000 emails/month (enough for ~750 users with weekly matches)
- Pro: $20/month for 50,000 emails

**OpenAI (Cold Message Generation):**
- GPT-4o-mini: ~$0.0001 per message
- 3 matches × 750 users = 2,250 messages/month ≈ $0.23/month

**Total Monthly Cost:**
- Under 750 users: **FREE**
- 750-12,500 users: **$20.23/month**

## Alternative Email Providers

If you prefer a different provider:

### SendGrid
- Free: 100 emails/day
- Update code to use SendGrid API
- Similar setup process

### AWS SES
- $0.10 per 1,000 emails
- Requires AWS account setup
- More complex configuration

### Mailgun
- Free: 5,000 emails/month
- Good deliverability
- Similar API to Resend

## Security Notes

- API keys are stored as Supabase secrets (encrypted)
- Never commit API keys to Git
- Use different API keys for development/production
- Email logs track all sent emails for auditing

## Next Steps

1. ✅ Set up Resend account
2. ✅ Add API key to Supabase
3. ✅ Test email sending
4. 🔲 (Optional) Configure custom domain
5. 🔲 Monitor email deliverability
6. 🔲 Set up weekly cron job for batch emails

---

Need help? Check [Resend Documentation](https://resend.com/docs) or [Supabase Functions](https://supabase.com/docs/guides/functions)
