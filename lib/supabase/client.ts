import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  __bluffclub_browser_supabase__?: SupabaseClient;
};

/**
 * Single Supabase browser client per tab. Calling `createClient` repeatedly
 * instantiates multiple GoTrue clients on the same storage key and triggers
 * Supabase warnings.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!globalForSupabase.__bluffclub_browser_supabase__) {
    globalForSupabase.__bluffclub_browser_supabase__ = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return globalForSupabase.__bluffclub_browser_supabase__;
}

/** @deprecated Use `getBrowserSupabase` — alias kept for call sites. */
export const createBrowserSupabase = getBrowserSupabase;
