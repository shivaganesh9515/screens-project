// POST /api/auth/login
// Authenticates user against local SQLite database
// Returns a JWT session cookie

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth/session";
import { getUserByEmail } from "@/lib/auth/user";
import { verifyPassword } from "@/lib/auth/password";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: false, // local dev
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err: any) {
    console.error("[Auth] Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
