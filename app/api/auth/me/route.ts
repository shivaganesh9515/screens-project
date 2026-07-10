// GET /api/auth/me
// Returns the current authenticated user from the session cookie

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth/session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = verifySessionToken(token);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("[Auth] Me error:", err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
