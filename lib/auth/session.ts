// JWT-based session management for local auth
// Uses 'jose' library for Edge runtime compatibility (middleware)
// NOTE: This file must NOT import 'better-sqlite3' (native modules don't work in Edge)

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.LOCAL_AUTH_SECRET || "local-dev-secret-do-not-use-in-production-32chars"
);
const COOKIE_NAME = "local_session";
const SESSION_DURATION = "7d";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(SESSION_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SESSION_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export { COOKIE_NAME, SESSION_SECRET };
