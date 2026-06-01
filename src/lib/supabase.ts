import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function verifySupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from("contact_messages")
      .select("id")
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}
