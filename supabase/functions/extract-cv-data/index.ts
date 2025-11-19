// Supabase Edge Function to extract data from CV using OpenAI
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get request body
    const { userId, cvPath } = await req.json();

    if (!userId || !cvPath) {
      throw new Error("Missing required parameters: userId or cvPath");
    }

    // Validate PDF file
    if (!cvPath.toLowerCase().endsWith('.pdf')) {
      throw new Error("Only PDF files are supported");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OpenAI API key
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

    // 2. Convert PDF to base64 for OpenAI PDF endpoint
    const arrayBuffer = await cvData.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    console.log("PDF converted to base64, sending to OpenAI...");

    // 3. Use OpenAI's PDF understanding capability with GPT-4o
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert CV data extraction assistant. Your task is to carefully read a CV/resume and extract specific information.

EXTRACTION GUIDELINES:

1. **Name Extraction:**
   - Look at the top of the CV (usually in header or first few lines)
   - First name is typically the first word of the full name
   - Last name is typically the last word of the full name
   - Example: "John Michael Smith" → first_name: "John", last_name: "Smith"

2. **LinkedIn URL:**
   - Look for: "linkedin.com/in/...", "LinkedIn:", or LinkedIn icon
   - Must be a complete URL starting with "linkedin.com" or "www.linkedin.com"
   - If you find just a username, format it as: "linkedin.com/in/username"

3. **Years of Experience:**
   - Calculate from work history dates (subtract earliest start date from present/latest end date)
   - Look for: "Experience", "Work History", "Professional Experience" sections
   - Count only professional work experience, not internships or academic roles
   - If dates are unclear, look for explicit statements like "5+ years of experience"

4. **Undergraduate University:**
   - Look in "Education" section
   - Find the FIRST university degree (Bachelor's, BSc, BA, etc.)
   - Extract full university name, not abbreviations
   - Example: "University of California, Berkeley" not "UC Berkeley"
   - Ignore: LBS (London Business School) - we need undergraduate institution

5. **Languages:**
   - Look for: "Languages", "Language Skills", or language proficiency mentions
   - Extract language names only (not proficiency levels)
   - Return as array: ["English", "Spanish", "Mandarin"]
   - If proficiency is mentioned, only include languages with conversational level or higher

6. **Current Location:**
   - Look for: Address, "Location:", "Based in:", or city mentions near contact info
   - Format as "City, Country" (e.g., "London, UK")
   - If only city is mentioned, include it

7. **Current Role:**
   - Find the MOST RECENT job title in work experience
   - Look at the top of the "Experience" section
   - Extract exact title as written
   - If currently studying, use "Student" or "Graduate Student"

8. **Current Company:**
   - Find the MOST RECENT employer in work experience
   - Look at the top of the "Experience" section
   - Extract full company name
   - If currently studying, use "London Business School" or the university name

IMPORTANT RULES:
- If information is not explicitly stated, return null (not a guess)
- Do not infer or assume information
- Return empty array [] for languages if none are found
- Double-check dates when calculating years of experience
- Prioritize accuracy over completeness

Return ONLY a valid JSON object with these exact field names:
{
  "first_name": string | null,
  "last_name": string | null,
  "linkedin_url": string | null,
  "years_of_experience": number | null,
  "undergraduate_university": string | null,
  "languages": string[],
  "current_location": string | null,
  "current_role": string | null,
  "current_company": string | null
}`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please extract the required information from this CV/resume. Follow the extraction guidelines carefully and return only the JSON object.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    
    if (!openaiData.choices || !openaiData.choices[0]) {
      throw new Error("Invalid response from OpenAI");
    }

    const extractedData: CVExtractionResult = JSON.parse(
      openaiData.choices[0].message.content
    );

    console.log("Extracted data:", extractedData);

    // 4. Validate extracted data
    // Clean up LinkedIn URL if needed
    if (extractedData.linkedin_url && !extractedData.linkedin_url.startsWith('http')) {
      extractedData.linkedin_url = `https://${extractedData.linkedin_url}`;
    }

    // Ensure languages is an array
    if (!Array.isArray(extractedData.languages)) {
      extractedData.languages = [];
    }

    // 5. Update profile with extracted data
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
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      throw new Error(`Failed to update profile: ${updateError.message}`);
    }

    console.log(`Successfully updated profile for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
        message: "CV data extracted and profile updated successfully"
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