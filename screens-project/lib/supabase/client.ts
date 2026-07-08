import { createBrowserClient } from "@supabase/ssr";
import { createMockClient } from "./mock-client";

export function createClient() {
  // Use mock client when Supabase env vars are not set (local dev without Docker)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log("[Supabase] Using mock client (env vars not configured)");
    return createMockClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
