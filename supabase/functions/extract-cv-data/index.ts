// Supabase Edge Function to extract data from CV using OpenAI Assistants API
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CVExtractionResult {
  first_name: string | null;
  last_name: string | null;
  linkedin_url: string | null;
  years_of_experience: number | null;
  undergraduate_university: string | null;
  languages: string[];
  current_location: string | null;
  current_role: string | null;
  current_company: string | null;
  lbs_program: string | null;
  graduation_year: number | null;
}

// Helper function to poll for assistant run completion
async function waitForRunCompletion(
  threadId: string,
  runId: string,
  openaiApiKey: string
): Promise<any> {
  let attempts = 0;
  const maxAttempts = 30; // 30 seconds max wait

  while (attempts < maxAttempts) {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
      {
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const run = await response.json();

    if (run.status === "completed") {
      return run;
    } else if (run.status === "failed" || run.status === "cancelled" || run.status === "expired") {
      throw new Error(`Run ${run.status}: ${run.last_error?.message || "Unknown error"}`);
    }

    // Wait 1 second before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  throw new Error("Assistant run timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, cvPath } = await req.json();

    if (!userId || !cvPath) {
      throw new Error("Missing required parameters: userId or cvPath");
    }

    if (!cvPath.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are supported");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log(`Processing CV for user ${userId} at path ${cvPath}`);

    // 1. Download CV from storage
    const { data: cvData, error: downloadError } = await supabase.storage
      .from("cvs")
      .download(cvPath);

    if (downloadError) {
      throw new Error(`Failed to download CV: ${downloadError.message}`);
    }

    console.log("CV downloaded, uploading to OpenAI...");

    // 2. Upload file to OpenAI
    const arrayBuffer = await cvData.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    
    const formData = new FormData();
    formData.append("file", blob, "cv.pdf");
    formData.append("purpose", "assistants");

    const uploadResponse = await fetch("https://api.openai.com/v1/files", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      throw new Error(`Failed to upload file to OpenAI: ${error}`);
    }

    const fileData = await uploadResponse.json();
    const fileId = fileData.id;
    console.log(`File uploaded to OpenAI: ${fileId}`);

    // 3. Create Assistant with file search capability
    const assistantResponse = await fetch("https://api.openai.com/v1/assistants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        name: "CV Data Extractor",
        instructions: `You are an expert CV/resume data extraction assistant. You will be given a CV/resume PDF file and must extract specific information accurately.

CRITICAL EXTRACTION RULES:

**Name (MOST IMPORTANT - Read the EXACT name from the document):**
- Look at the very top of the CV - the name is usually the largest text at the top
- Extract the EXACT spelling as written - do not modify or assume
- first_name: First word of the full name
- last_name: Last word(s) of the full name
- Example: "Isaac Hasbani" → first_name: "Isaac", last_name: "Hasbani"
- If you see "Isaac Hasbani", the last name is "Hasbani" NOT "Ashbani" or any variation

**LinkedIn URL:**
- Look in the header/contact section (usually near email/phone)
- Extract the FULL URL or username
- Common formats: "LinkedIn", "linkedin.com/in/xxx", or just a hyperlink
- If you see just "LinkedIn" as a link text, note that but return null if you can't find the actual URL

**LBS Program (London Business School):**
- Look in the Education section for "London Business School"
- Extract the exact program name: "Master's in Analytics and Management" → "MAM"
- Possible values: MAM, MIM, MBA, MFA
- Match the program title to these codes:
  - "Analytics and Management" or "Master's in Analytics and Management" → "MAM"
  - "Management" or "Master in Management" → "MIM"
  - "Master of Business Administration" or "MBA" → "MBA"
  - "Master in Financial Analysis" or "MFA" → "MFA"

**Graduation Year (LBS):**
- Look at the dates for London Business School education
- Extract the END year (when they graduate/graduated)
- Example: "2024 - 2025 London Business School" → graduation_year: 2025

**Undergraduate University:**
- Find the BACHELOR'S degree in Education section
- Extract the full university name EXACTLY as written
- Look for: "Bachelor", "BSc", "BA", "B.Eng", etc.
- Example: "Università Commerciale Luigi Bocconi" (keep the exact spelling)
- IGNORE: Master's degrees, London Business School, exchange programs

**Languages:**
- Look for a "Languages" section (usually at the bottom)
- Extract ONLY the language names as an array
- Example: "Italian (native), English (fluent), French (fluent), Spanish (conversational)"
  → languages: ["Italian", "English", "French", "Spanish"]
- Include ALL languages mentioned, regardless of proficiency level

**Years of Experience:**
- Look at the "Business Experience" or "Work Experience" section
- Calculate: (Latest end date OR current year) - (Earliest start date)
- Count internships and full-time roles
- Example: Experience from 2023 to 2025 → 2 years

**Current Location:**
- Look in the header/contact section for address or location
- Often near phone number and email
- Format as "City, Country"

**Current Role & Company:**
- Find the MOST RECENT position (topmost in experience section)
- Extract the exact job title and company name
- If currently a student at LBS, role could be "Student" or the most recent role before studies

IMPORTANT:
- Read the PDF carefully - do not guess or make assumptions
- If information is clearly stated, extract it exactly as written
- If information is not found, return null
- Pay special attention to spelling - extract names and text EXACTLY as they appear
- For LBS program, match the degree title to the correct code (MAM/MIM/MBA/MFA)

Return ONLY valid JSON with NO additional text.`,
        tools: [{ type: "file_search" }],
      }),
    });

    if (!assistantResponse.ok) {
      const error = await assistantResponse.text();
      throw new Error(`Failed to create assistant: ${error}`);
    }

    const assistant = await assistantResponse.json();
    console.log(`Assistant created: ${assistant.id}`);

    // 4. Create Thread with the file
    const threadResponse = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Please extract the following information from the attached CV and return it as a JSON object:

{
  "first_name": string | null,
  "last_name": string | null,
  "linkedin_url": string | null,
  "years_of_experience": number | null,
  "undergraduate_university": string | null,
  "languages": string[],
  "current_location": string | null,
  "current_role": string | null,
  "current_company": string | null,
  "lbs_program": string | null,
  "graduation_year": number | null
}

Remember to:
- Extract the EXACT name spelling from the top of the CV
- Find the LinkedIn URL in the contact section
- Identify the LBS program code (MAM/MIM/MBA/MFA) from the degree title
- Get the LBS graduation year from the education dates
- Extract ALL languages mentioned
- Get the undergraduate university name (Bachelor's degree only)

Return ONLY the JSON object, no additional text.`,
            attachments: [
              {
                file_id: fileId,
                tools: [{ type: "file_search" }],
              },
            ],
          },
        ],
      }),
    });

    if (!threadResponse.ok) {
      const error = await threadResponse.text();
      throw new Error(`Failed to create thread: ${error}`);
    }

    const thread = await threadResponse.json();
    console.log(`Thread created: ${thread.id}`);

    // 5. Run the Assistant
    const runResponse = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
        body: JSON.stringify({
          assistant_id: assistant.id,
        }),
      }
    );

    if (!runResponse.ok) {
      const error = await runResponse.text();
      throw new Error(`Failed to run assistant: ${error}`);
    }

    const run = await runResponse.json();
    console.log(`Run started: ${run.id}`);

    // 6. Wait for completion
    console.log("Waiting for assistant to complete...");
    await waitForRunCompletion(thread.id, run.id, openaiApiKey);

    // 7. Get the response
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages`,
      {
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    const messages = await messagesResponse.json();
    const assistantMessage = messages.data.find((msg: any) => msg.role === "assistant");

    if (!assistantMessage) {
      throw new Error("No response from assistant");
    }

    // Extract text from message
    let responseText = assistantMessage.content[0].text.value;
    
    // Clean up the response (remove markdown code blocks if present)
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    console.log("Assistant response:", responseText);

    const extractedData: CVExtractionResult = JSON.parse(responseText);

    // 8. Cleanup - delete the file from OpenAI (optional but good practice)
    try {
      await fetch(`https://api.openai.com/v1/files/${fileId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
        },
      });
      console.log(`Cleaned up file: ${fileId}`);
    } catch (e) {
      console.warn("Failed to delete file:", e);
    }

    // 9. Validate and clean data
    if (extractedData.linkedin_url) {
      let url = extractedData.linkedin_url.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      extractedData.linkedin_url = url;
    }

    if (!Array.isArray(extractedData.languages)) {
      extractedData.languages = [];
    }

    console.log("Final extracted data:", JSON.stringify(extractedData, null, 2));

    // 10. Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: extractedData.first_name,
        last_name: extractedData.last_name,
        linkedin_url: extractedData.linkedin_url,
        years_of_experience: extractedData.years_of_experience,
        undergraduate_university: extractedData.undergraduate_university,
        languages: extractedData.languages,
        current_location: extractedData.current_location,
        current_role: extractedData.current_role,
        current_company: extractedData.current_company,
        lbs_program: extractedData.lbs_program,
        graduation_year: extractedData.graduation_year,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log(`Successfully updated profile for user ${userId}`);

    // 11. Fetch the complete profile to generate summary
    console.log("Fetching complete profile for summary generation...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Failed to fetch profile:", profileError);
      // Don't fail the entire operation, just log the error
    } else if (profileData) {
      console.log("Generating profile summary...");

      // 12. Generate profile summary using OpenAI
      try {
        const summaryPrompt = `You are an expert at creating concise professional profile summaries for networking and career matching purposes.

Given the following profile data, create a structured JSON summary that will be used to match this person with other professionals based on:
- Shared career interests and goals
- Complementary professional backgrounds
- Industry alignment
- Common educational backgrounds
- Networking objectives

Profile Data:
- Name: ${profileData.first_name} ${profileData.last_name}
- User Type: ${profileData.user_type} (${profileData.user_type === 'student' ? 'current student' : 'alumni'})
- LBS Program: ${profileData.lbs_program || 'Not specified'} (Graduation: ${profileData.graduation_year || 'Not specified'})
- Undergraduate: ${profileData.undergraduate_university || 'Not specified'}
- Years of Experience: ${profileData.years_of_experience || 0}
- Current Role: ${profileData.current_role || 'Not specified'} at ${profileData.current_company || 'Not specified'}
- Location: ${profileData.current_location || 'Not specified'}
- Languages: ${profileData.languages?.join(', ') || 'Not specified'}
- Networking Goal: ${profileData.networking_goal || 'Not specified'}
- Target Industries: ${profileData.target_industries?.join(', ') || 'Not specified'}
- Specific Interests: ${profileData.specific_interests || 'Not specified'}

Create a JSON object with the following structure:

{
  "professional_background": "A 2-3 sentence summary of their work experience and current role",
  "education_summary": "A brief summary of their educational background including LBS program and undergraduate university",
  "career_goals": "1-2 sentences about what they want to achieve professionally",
  "target_industries": ["array", "of", "industries"],
  "interests": "A concise summary of their specific interests and what they're passionate about",
  "key_strengths": ["array", "of", "3-5", "notable", "skills or experiences"],
  "languages": ["array", "of", "languages"],
  "networking_purpose": "What they're looking for in professional connections (1 sentence)",
  "match_keywords": ["array", "of", "10-15", "keywords", "for", "matching"]
}

Important:
- Keep summaries concise and focused on information relevant for matching
- Extract key themes and skills from their experience
- Highlight what makes them unique or interesting for networking
- Use the networking goal to understand what they're seeking
- Generate match_keywords that include: industries, skills, interests, roles, and themes
- Be specific and avoid generic statements

Return ONLY the JSON object, no additional text.`;

        const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an expert at creating structured professional profile summaries for networking and matching purposes. Always return valid JSON only."
              },
              {
                role: "user",
                content: summaryPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!summaryResponse.ok) {
          const error = await summaryResponse.text();
          throw new Error(`Failed to generate summary: ${error}`);
        }

        const summaryResult = await summaryResponse.json();
        let summaryText = summaryResult.choices[0].message.content.trim();

        // Clean up markdown code blocks if present
        summaryText = summaryText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const summaryJson = JSON.parse(summaryText);

        console.log("Profile summary generated:", JSON.stringify(summaryJson, null, 2));

        // 13. Store or update the profile summary
        const { error: summaryError } = await supabase
          .from("profile_summaries")
          .upsert({
            user_id: userId,
            summary_json: summaryJson,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (summaryError) {
          console.error("Failed to store profile summary:", summaryError);
          // Don't fail the entire operation
        } else {
          console.log("Profile summary stored successfully");
        }
      } catch (summaryError) {
        console.error("Error generating/storing profile summary:", summaryError);
        // Don't fail the entire operation, profile update was successful
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        message: "CV data extracted, profile updated, and summary generated successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in extract-cv-data function:", error);
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