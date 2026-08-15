import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public registration paths from role checks
  if (
    pathname === "/restaurant/register" ||
    pathname === "/rider/register" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("fooddrop_session")?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  const loginRedirectUrl = new URL("/login", request.url);
  loginRedirectUrl.searchParams.set("redirect", pathname);

  // 2. Protected Restaurant Owner Routes
  if (pathname.startsWith("/restaurant")) {
    if (!session) {
      return NextResponse.redirect(loginRedirectUrl);
    }
    if (session.role !== "RESTAURANT_OWNER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 3. Protected Rider Routes
  if (pathname.startsWith("/rider")) {
    if (!session) {
      return NextResponse.redirect(loginRedirectUrl);
    }
    if (session.role !== "RIDER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // 4. Protected Customer & User Routes
  if (
    pathname.startsWith("/orders") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/profile")
  ) {
    if (!session) {
      return NextResponse.redirect(loginRedirectUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/restaurant/:path*",
    "/rider/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/profile/:path*",
  ],
};
