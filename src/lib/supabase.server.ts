import { createClient } from "@supabase/supabase-js";
import process from "node:process";

const supabaseUrl = process.env.SUPABASE_URL;
// Use the service role key to bypass RLS on server operations, fall back to anon key if not set
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY environment variables are missing!",
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseKey || "");
