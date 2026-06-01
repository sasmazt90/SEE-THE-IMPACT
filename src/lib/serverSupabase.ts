import { createClient } from "@supabase/supabase-js";

export function createOptionalSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseClientKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !supabaseClientKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseClientKey);
}
