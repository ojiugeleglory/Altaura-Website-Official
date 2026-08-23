// Altaura Insights — Supabase connection
//
// Fill these two values in from your Supabase project.
// Project Settings -> API -> Project URL, and Project API keys -> anon public.
// These are safe to expose in client-side code; row-level security in the
// database is what actually protects the data (see sql/insights_schema.sql).

const SUPABASE_URL = "https://dmgqcqjfwgkmudyiwwuz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_rIk2dffs1CbqdAtzMeKFsg_n-sSehDa";

const supabaseClient = (SUPABASE_URL.startsWith("http"))
  ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!supabaseClient) {
  console.warn("Altaura Insights: Supabase is not configured yet. Fill in js/supabase-config.js with your project URL and anon key.");
}
