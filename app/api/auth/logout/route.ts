// POST /api/auth/logout
// Clears the local session cookie

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[Auth] Logout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
