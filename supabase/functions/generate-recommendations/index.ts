// Supabase Edge Function to generate personalized recommendations using LLM
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProfileSummaryJson {
  networking_goal: string | null;
  specific_interests: string | null;
  target_industries: string[];
  user_type: 'student' | 'alumni';
  match_preferences: {
    students: boolean;
    alumni: boolean;
  };
  education_summary: string | null;
  languages: string[];
  lbs_program: string | null;
  work_history: Array<{ role: string; company: string; years: string }>;
}

interface CandidateWithSummary {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  linkedin_url: string | null;
  current_role: string | null;
  lbs_program: string | null;
  graduation_year: number | null;
  undergraduate_university: string | null;
  summary: ProfileSummaryJson;
}

interface RecommendationResult {
  matched_user_id: string;
  score: number;
  reason: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("Missing required parameter: userId");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    console.log(`Generating recommendations for user ${userId}`);

    // 1. Fetch user's profile and profile summary
    const { data: userProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (profileError || !userProfile) {
      throw new Error("User profile not found");
    }

    const { data: userSummary, error: summaryError } = await supabase
      .from("profile_summaries")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (summaryError || !userSummary) {
      throw new Error("User profile summary not found. Please complete onboarding first.");
    }

    console.log(`User profile loaded: ${userProfile.first_name} ${userProfile.last_name}`);

    // 2. Filter candidates based on match preferences
    let candidateQuery = supabase
      .from("profiles")
      .select("*")
      .neq("user_id", userId) // Exclude the user themselves
      .eq("onboarding_completed", true);

    // Apply user's preferences: what type of users do they want to connect with?
    const acceptedTypes: string[] = [];
    if (userProfile.connect_with_students) acceptedTypes.push("student");
    if (userProfile.connect_with_alumni) acceptedTypes.push("alumni");

    if (acceptedTypes.length === 0) {
      throw new Error("User has not selected any match preferences");
    }

    if (acceptedTypes.length < 2) {
      // Only filter if not connecting with both
      candidateQuery = candidateQuery.in("user_type", acceptedTypes);
    }

    const { data: candidates, error: candidatesError } = await candidateQuery;

    if (candidatesError) {
      throw new Error(`Failed to fetch candidates: ${candidatesError.message}`);
    }

    if (!candidates || candidates.length === 0) {
      console.log("No candidates found matching criteria");
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: "No matches found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${candidates.length} potential candidates`);

    // 3. Filter candidates who are willing to connect with the user's type
    const filteredCandidates = candidates.filter(candidate => {
      if (userProfile.user_type === "student") {
        return candidate.connect_with_students;
      } else {
        return candidate.connect_with_alumni;
      }
    });

    if (filteredCandidates.length === 0) {
      console.log("No candidates willing to connect with user type");
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: "No matches found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`${filteredCandidates.length} candidates willing to connect`);

    // 4. Fetch profile summaries for all filtered candidates
    const candidateIds = filteredCandidates.map(c => c.user_id);
    const { data: candidateSummaries, error: summariesError } = await supabase
      .from("profile_summaries")
      .select("*")
      .in("user_id", candidateIds);

    if (summariesError) {
      throw new Error(`Failed to fetch candidate summaries: ${summariesError.message}`);
    }

    // Map summaries to candidates
    const candidatesWithSummaries: CandidateWithSummary[] = filteredCandidates
      .map(candidate => {
        const summary = candidateSummaries?.find(s => s.user_id === candidate.user_id);
        if (!summary) return null;

        return {
          user_id: candidate.user_id,
          first_name: candidate.first_name || "Unknown",
          last_name: candidate.last_name || "Unknown",
          email: candidate.email,
          linkedin_url: candidate.linkedin_url,
          current_role: candidate.current_role,
          lbs_program: candidate.lbs_program,
          graduation_year: candidate.graduation_year,
          undergraduate_university: candidate.undergraduate_university,
          summary: summary.summary_json as ProfileSummaryJson,
        };
      })
      .filter((c): c is CandidateWithSummary => c !== null);

    if (candidatesWithSummaries.length === 0) {
      console.log("No candidates with profile summaries found");
      return new Response(
        JSON.stringify({
          success: true,
          data: [],
          message: "No matches found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`${candidatesWithSummaries.length} candidates have profile summaries`);

    // 5. Use OpenAI to analyze and rank matches
    const userSummaryJson = userSummary.summary_json as ProfileSummaryJson;

    const prompt = `You are a professional networking matchmaker for London Business School (LBS). Your task is to analyze a user's profile and recommend the top 3 most compatible contacts from a pool of candidates.

**User Profile:**
Name: ${userProfile.first_name} ${userProfile.last_name}
Type: ${userProfile.user_type}
LBS Program: ${userProfile.lbs_program || "N/A"} ${userProfile.graduation_year || ""}
Undergraduate: ${userProfile.undergraduate_university || "N/A"}
Current Role: ${userProfile.current_role || "N/A"}
Networking Goal: ${userSummaryJson.networking_goal || "N/A"}
Target Industries: ${userSummaryJson.target_industries.join(", ") || "N/A"}
Specific Interests: ${userSummaryJson.specific_interests || "N/A"}
Work History: ${JSON.stringify(userSummaryJson.work_history || [])}

**Candidates:**
${candidatesWithSummaries.map((candidate, idx) => `
Candidate ${idx + 1}:
- ID: ${candidate.user_id}
- Name: ${candidate.first_name} ${candidate.last_name}
- Type: ${candidate.summary.user_type}
- LBS Program: ${candidate.lbs_program || "N/A"} ${candidate.graduation_year || ""}
- Undergraduate: ${candidate.undergraduate_university || "N/A"}
- Current Role: ${candidate.current_role || "N/A"}
- Networking Goal: ${candidate.summary.networking_goal || "N/A"}
- Target Industries: ${candidate.summary.target_industries.join(", ") || "N/A"}
- Specific Interests: ${candidate.summary.specific_interests || "N/A"}
- Work History: ${JSON.stringify(candidate.summary.work_history || [])}
`).join("\n")}

**Your Task:**
Analyze the user profile against all candidates and select the TOP 3 BEST MATCHES based on:
1. **Shared Industries**: Common target industries or career paths
2. **Complementary Goals**: How their networking goals align or complement each other
3. **Common Background**: Same undergraduate university, similar work experience, or shared interests
4. **LBS Connection**: Same or complementary LBS programs
5. **Mutual Benefit**: How both parties could benefit from the connection

For each of the top 3 matches, provide:
- A compatibility score (0.0 to 1.0, where 1.0 is perfect match)
- A personalized reason (2-3 sentences) explaining WHY this person would be a valuable connection

Return ONLY valid JSON in this exact format, no additional text:
{
  "recommendations": [
    {
      "matched_user_id": "user_id_here",
      "score": 0.95,
      "reason": "Personalized reason here explaining the match value"
    }
  ]
}

IMPORTANT: Return exactly 3 recommendations (or fewer if less than 3 candidates). Sort by score descending.`;

    console.log("Sending request to OpenAI...");

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are a professional networking matchmaker. Analyze profiles and provide thoughtful, personalized match recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiResult = await openaiResponse.json();
    const responseText = openaiResult.choices[0].message.content;

    console.log("OpenAI response:", responseText);

    // Parse the response
    const cleanedResponse = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const matchingResult = JSON.parse(cleanedResponse);
    const recommendations: RecommendationResult[] = matchingResult.recommendations || [];

    console.log(`OpenAI returned ${recommendations.length} recommendations`);

    // 6. Store matches in database
    const matchesToInsert = recommendations.map(rec => ({
      user_id: userId,
      matched_user_id: rec.matched_user_id,
      score: rec.score,
      reason: rec.reason,
      status: "pending",
      expires_at: null,
    }));

    // Delete existing pending matches for this user
    await supabase
      .from("matches")
      .delete()
      .eq("user_id", userId)
      .eq("status", "pending");

    // Insert new matches
    const { data: insertedMatches, error: insertError } = await supabase
      .from("matches")
      .insert(matchesToInsert)
      .select();

    if (insertError) {
      console.error("Failed to insert matches:", insertError);
      throw new Error(`Failed to store matches: ${insertError.message}`);
    }

    console.log(`Successfully stored ${insertedMatches.length} matches`);

    // 7. Fetch complete match data with profile information
    const { data: completeMatches, error: fetchError } = await supabase
      .from("matches")
      .select(`
        *,
        matched_profile:profiles!matches_matched_user_id_fkey(
          first_name,
          last_name,
          email,
          linkedin_url,
          current_role,
          lbs_program,
          graduation_year
        )
      `)
      .eq("user_id", userId)
      .eq("status", "pending")
      .order("score", { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch complete matches: ${fetchError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: completeMatches,
        message: `Successfully generated ${completeMatches?.length || 0} recommendations`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in generate-recommendations function:", error);
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
