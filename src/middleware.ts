import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/templates",
  "/f/", // Public form viewing
  "/api/auth", // Auth API routes
];

const authPaths = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Homepage is public
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Check if it's an auth path (login, register, etc.)
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Get session token from cookies
  const sessionCookie = request.cookies.get("better-auth.session_token");
  const hasSession = !!sessionCookie?.value;

  // If user has session and is trying to access auth pages, redirect to dashboard
  if (hasSession && isAuthPath) {
    return NextResponse.redirect(new URL("/forms", request.url));
  }

  // If path is not public and user has no session, redirect to login
  if (!isPublicPath && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes except auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api(?!/auth)).*)",
  ],
};
