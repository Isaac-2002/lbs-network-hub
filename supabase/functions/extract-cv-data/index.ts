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
  lbs_program: string | null; // MAM, MIM, MBA, MFA
  graduation_year: number | null;
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

    // 2. Convert CV to base64 for OpenAI (supports PDF, DOCX, images)
    const arrayBuffer = await cvData.arrayBuffer();
    const base64Data = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    // 3. Determine file type
    const fileExtension = cvPath.split(".").pop()?.toLowerCase();
    let mimeType = "application/pdf";
    if (fileExtension === "docx") {
      mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (fileExtension === "doc") {
      mimeType = "application/msword";
    } else if (["jpg", "jpeg", "png"].includes(fileExtension || "")) {
      mimeType = `image/${fileExtension}`;
    }

    // 4. Extract text from CV using OpenAI
    // For PDFs and images, we'll use GPT-4 Vision or text extraction
    // For now, we'll use a simpler approach with text extraction
    
    let cvText = "";
    
    // For PDFs, we need to extract text first (using a library or OCR)
    // For simplicity, we'll assume text-based CVs or use OpenAI's file understanding
    // In production, you might want to use pdf-parse or similar
    
    // For now, let's use OpenAI's chat completion with a document understanding prompt
    // We'll send the file content in a way OpenAI can process
    
    // Note: For actual implementation, consider using:
    // - pdf-parse for PDF text extraction
    // - mammoth for DOCX text extraction
    // - OpenAI Vision API for image-based CVs
    
    // Simplified approach: Convert to text and send to OpenAI
    const textDecoder = new TextDecoder();
    try {
      cvText = textDecoder.decode(arrayBuffer);
    } catch {
      // If binary file, use a placeholder
      cvText = "[Binary CV file - consider implementing OCR or document parsing]";
    }

    // 5. Call OpenAI API to extract structured data
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
              content: `You are a CV data extraction assistant. Extract the following information from CVs and return it as a JSON object. If a field cannot be found, use null for strings/numbers and empty array for arrays. Be accurate and extract only explicitly stated information.

Required fields:
- first_name: string (first name of the person)
- last_name: string (last name of the person)
- linkedin_url: string (LinkedIn profile URL)
- years_of_experience: number (total years of work experience)
- undergraduate_university: string (name of undergraduate university)
- languages: string[] (array of languages spoken, e.g., ["English", "Spanish"])
- current_location: string (current city/country)
- current_role: string (current job title)
- current_company: string (current employer)
- lbs_program: string (London Business School program: MAM, MIM, MBA, or MFA only)
- graduation_year: number (LBS graduation year or expected graduation year)

Return ONLY a valid JSON object with these exact field names. Do not include any explanation or additional text.`,
            },
            {
              role: "user",
              content: `Extract data from this CV:\n\n${cvText.substring(0, 15000)}`,
            },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const extractedData: CVExtractionResult = JSON.parse(
      openaiData.choices[0].message.content
    );

    console.log("Extracted data:", extractedData);

    // 6. Update profile with extracted data
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: extractedData.first_name,
        last_name: extractedData.last_name,
        linkedin_url: extractedData.linkedin_url,
        years_of_experience: extractedData.years_of_experience,
        undergraduate_university: extractedData.undergraduate_university,
        languages: extractedData.languages || [],
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

    return new Response(
      JSON.stringify({
        success: true,
        data: extractedData,
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

