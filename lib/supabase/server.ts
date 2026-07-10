// Server-side Supabase-compatible client using local SQLite
// Same import path as before — existing Server Components continue to work

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createSqliteClient } from "@/lib/db/sqlite-client";

export async function createClient() {
  // Use SQLite client for local development (no Docker/Supabase needed)
  console.log("[Supabase] Using local SQLite client (server)");
  return createSqliteClient() as any;
}
