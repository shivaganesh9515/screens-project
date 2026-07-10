import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/auth/session";

const SESSION_SECRET = new TextEncoder().encode(
  process.env.LOCAL_AUTH_SECRET || "local-dev-secret-do-not-use-in-production-32chars"
);

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Check local session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let user: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, SESSION_SECRET);
      user = payload;
    } catch {
      // Invalid token — ignore
    }
  }

  const pathname = request.nextUrl.pathname;

  // API routes — pass through (they handle auth themselves)
  if (pathname.startsWith("/api/")) {
    // Attach user info to request header for API routes
    if (user) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.id);
      requestHeaders.set("x-user-role", user.role);
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return response;
  }

  // Player pages — always allowed
  if (pathname.startsWith("/player")) {
    return response;
  }

  // Auth pages
  const isAuthPage = pathname === "/login" || pathname === "/signup" ||
    pathname === "/reset-password" || pathname.startsWith("/auth/");

  // Redirect unauthenticated users to login
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login page
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    // Route based on role
    if (user.role === "franchise_manager") {
      url.pathname = "/franchise";
    } else if (user.role === "advertiser") {
      url.pathname = "/advertiser";
    } else if (user.role === "admin" || user.role === "main_admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/overview";
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
