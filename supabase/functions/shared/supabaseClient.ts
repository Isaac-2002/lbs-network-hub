// Shared Supabase client for edge functions
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create a Supabase client instance
 * Uses service role key for admin operations
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
  return supabaseClient;
}
