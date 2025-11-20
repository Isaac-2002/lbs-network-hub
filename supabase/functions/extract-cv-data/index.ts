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
  work_history: Array<{ role: string; company: string; years: string }>;
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
        instructions: `Extract data from CV PDF and return as JSON. Extract EXACT text as written.

Fields to extract:
- first_name, last_name: From document header (exact spelling)
- linkedin_url: Full URL from contact section
- undergraduate_university: Bachelor's degree university name only (exact spelling)
- languages: Array of all languages mentioned
- current_location: "City, Country" from contact section
- current_role, current_company: Most recent position
- lbs_program: "MAM", "MIM", "MBA", or "MFA" based on London Business School degree title
- graduation_year: End year from LBS education dates
- work_history: Array of objects with {role, company, years} for all positions listed
- years_of_experience: Calculate from earliest to latest work date

Return ONLY valid JSON, no additional text. Use null if information not found.`,
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
            content: `Extract all fields from the attached CV as specified in your instructions. Return only valid JSON.`,
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
        work_history: extractedData.work_history,
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log(`Successfully updated profile for user ${userId}`);

    // 11. Fetch the complete profile to build summary
    console.log("Fetching complete profile for summary...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Failed to fetch profile:", profileError);
      // Don't fail the entire operation, just log the error
    } else if (profileData) {
      console.log("Building profile summary from extracted data...");

      // 12. Build profile summary programmatically (no LLM call needed)
      try {
        const educationSummary = [
          profileData.lbs_program ? `${profileData.lbs_program} at London Business School` : null,
          profileData.graduation_year ? `(${profileData.graduation_year})` : null,
          profileData.undergraduate_university ? `Undergraduate: ${profileData.undergraduate_university}` : null
        ].filter(Boolean).join(' ');

        const profileSummary = {
          networking_goal: profileData.networking_goal || null,
          specific_interests: profileData.specific_interests || null,
          target_industries: profileData.target_industries || [],
          user_type: profileData.user_type || null,
          match_preferences: {
            students: profileData.connect_with_students || false,
            alumni: profileData.connect_with_alumni || false
          },
          education_summary: educationSummary || null,
          languages: profileData.languages || [],
          lbs_program: profileData.lbs_program || null,
          work_history: extractedData.work_history || []
        };

        console.log("Profile summary built:", JSON.stringify(profileSummary, null, 2));

        // 13. Store the profile summary
        const { error: summaryError } = await supabase
          .from("profile_summaries")
          .upsert({
            user_id: userId,
            summary_json: profileSummary,
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
        console.error("Error building/storing profile summary:", summaryError);
        // Don't fail the entire operation, profile update was successful
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        message: "CV data extracted, profile updated, and summary created successfully",
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