import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { Role, User } from "../types";

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const COOKIE_NAME = "fooddrop_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fooddrop-super-secure-production-secret-2026"
);

// 7 days in seconds
const SESSION_EXPIRATION_SECONDS = 7 * 24 * 60 * 60;

/**
 * Creates a signed JWT session token valid for 7 days.
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifies a JWT session token and returns the payload if valid.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as Role,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Attaches the HTTP-only session cookie to a NextResponse.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRATION_SECONDS,
  });
}

/**
 * Clears the session cookie on a NextResponse.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Extracts and verifies the session token from a standard Request object.
 */
export async function getSessionUserFromRequest(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[2] : null;

  if (!token) return null;
  return await verifySessionToken(token);
}
