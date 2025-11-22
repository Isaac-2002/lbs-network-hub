// Supabase Edge Function to send match notification emails
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Match {
  matched_user_id: string;
  first_name: string;
  last_name: string;
  lbs_program: string | null;
  graduation_year: number | null;
  linkedin_url: string | null;
  reason: string | null;
  current_role: string | null;
  networking_goal: string | null;
}

interface EmailPayload {
  userId: string;
  matches: Match[];
}

async function generateColdMessage(
  senderName: string,
  recipientName: string,
  recipientProgram: string | null,
  recipientRole: string | null,
  matchReason: string | null,
  senderGoal: string | null,
  openaiApiKey: string
): Promise<string> {
  const prompt = `Generate a professional, warm LinkedIn connection message from ${senderName} to ${recipientName}, a ${recipientProgram || "LBS network member"} ${recipientRole ? `working as ${recipientRole}` : ""}.

Context: ${matchReason || "Shared LBS background and complementary professional interests"}
Sender's goal: ${senderGoal || "Expanding professional network"}

Requirements:
- Keep it SHORT (3-4 sentences max, under 100 words)
- Mention their LBS connection
- Reference why you're reaching out (based on context)
- Be genuine and professional, not salesy
- End with a simple call to action (coffee chat, quick call, etc.)
- Don't use overly formal language

Return ONLY the message text, no subject line or additional formatting.`;

  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional networking coach helping craft warm, authentic LinkedIn messages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    }),
  });

  if (!openaiResponse.ok) {
    console.error("OpenAI API error:", await openaiResponse.text());
    return `Hi ${recipientName},\n\nI noticed we're both part of the LBS community and thought it would be great to connect. I'd love to learn more about your experience and share insights.\n\nWould you be open to a quick coffee chat?\n\nBest,\n${senderName}`;
  }

  const result = await openaiResponse.json();
  return result.choices[0].message.content.trim();
}

async function sendEmail(
  to: string,
  userName: string,
  matches: Match[],
  coldMessages: string[],
  resendApiKey: string,
  fromEmail: string
): Promise<void> {
  const matchesHtml = matches.map((match, idx) => {
    const linkedinLink = match.linkedin_url || "#";
    const programInfo = match.lbs_program && match.graduation_year
      ? `${match.lbs_program} ${match.graduation_year}`
      : match.lbs_program || "LBS Alumni";

    return `
      <div style="margin-bottom: 24px; padding: 24px; background: #1a1a1a; border-radius: 16px; border: 1px solid #333333;">
        <h3 style="margin: 0 0 12px 0; color: #fafafa; font-weight: 700;">${match.first_name} ${match.last_name}, ${programInfo}</h3>
        ${match.reason ? `<p style="margin: 0 0 16px 0; color: #999999; font-style: italic; line-height: 1.6;">${match.reason}</p>` : ""}
        <p style="margin: 0 0 20px 0;">
          <a href="${linkedinLink}" style="display: inline-block; color: #c1e649; text-decoration: none; font-weight: 600;" target="_blank">View LinkedIn Profile →</a>
        </p>

        <div style="background: #0d0d0d; padding: 16px; border-radius: 12px; border-left: 3px solid #c1e649;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #c1e649; font-size: 14px;">Suggested message:</p>
          <p style="margin: 0; color: #cccccc; white-space: pre-line; line-height: 1.6;">${coldMessages[idx]}</p>
        </div>
      </div>
    `;
  }).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fafafa; background: #0d0d0d; max-width: 600px; margin: 0 auto; padding: 32px 20px;">
        <div style="background: #1a1a1a; border-radius: 16px; padding: 32px; border: 1px solid #333333;">
          <div style="margin-bottom: 24px;">
            <h1 style="color: #c1e649; margin: 0 0 8px 0; font-size: 28px; font-weight: 700;">LBS Connect</h1>
            <div style="height: 3px; width: 60px; background: linear-gradient(90deg, #c1e649 0%, #ff8a29 100%); border-radius: 2px;"></div>
          </div>

          <h2 style="color: #fafafa; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Hi ${userName},</h2>

          <p style="color: #cccccc; margin-bottom: 28px; line-height: 1.6;">
            We just found ${matches.length === 1 ? "someone" : `${matches.length} people`} who you might be interested in talking to:
          </p>

          ${matchesHtml}

          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #333333;">
            <p style="color: #999999; margin: 0; line-height: 1.6;">
              Best,<br>
              <strong style="color: #fafafa;">The LBS Connect Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `Hi ${userName},

We just found ${matches.length === 1 ? "someone" : `${matches.length} people`} who you might be interested in talking to:

${matches.map((match, idx) => {
    const programInfo = match.lbs_program && match.graduation_year
      ? `${match.lbs_program} ${match.graduation_year}`
      : match.lbs_program || "LBS Alumni";

    return `${match.first_name} ${match.last_name}, ${programInfo}
${match.reason || ""}
LinkedIn: ${match.linkedin_url || "N/A"}

Suggested message:
${coldMessages[idx]}
`;
  }).join("\n---\n\n")}

Best,
The LBS Connect Team`;

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: `LBS Connect <${fromEmail}>`,
      to: [to],
      subject: `New networking matches found for you!`,
      html: htmlContent,
      text: textContent,
    }),
  });

  if (!emailResponse.ok) {
    const error = await emailResponse.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  console.log(`Email sent successfully to ${to}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, matches }: EmailPayload = await req.json();

    if (!userId || !matches || matches.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No matches to send",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    // Get sender email (defaults to testing email if not configured)
    const fromEmail = Deno.env.get("EMAIL_FROM_ADDRESS") || "ihasbani.mam2025@london.edu";

    // Fetch user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, email, networking_goal")
      .eq("user_id", userId)
      .single();

    if (profileError || !userProfile) {
      throw new Error("User profile not found");
    }

    const userName = userProfile.first_name || "there";
    const senderName = `${userProfile.first_name} ${userProfile.last_name}`;

    console.log(`Generating cold messages for ${matches.length} matches...`);

    // Generate cold messages for all matches
    const coldMessages = await Promise.all(
      matches.map((match) =>
        generateColdMessage(
          senderName,
          match.first_name,
          match.lbs_program && match.graduation_year
            ? `${match.lbs_program} ${match.graduation_year}`
            : match.lbs_program,
          match.current_role,
          match.reason,
          userProfile.networking_goal,
          openaiApiKey
        )
      )
    );

    console.log("Cold messages generated, sending email...");

    // Send email
    await sendEmail(
      userProfile.email,
      userName,
      matches,
      coldMessages,
      resendApiKey,
      fromEmail
    );

    // Log email in database
    await supabase.from("email_logs").insert({
      user_id: userId,
      email_type: "match_notification",
      status: "sent",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Email sent successfully to ${userProfile.email}`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in send-match-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
