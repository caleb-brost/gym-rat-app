import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublicKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL environment variable.");
}

if (!supabasePublicKey) {
  throw new Error(
    "Missing EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY environment variable.",
  );
}

export const supabase = createClient(supabaseUrl, supabasePublicKey);
