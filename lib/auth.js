import jwt from "jsonwebtoken";

const COOKIE_NAME = "aol_staff_session";
const SECRET = process.env.STAFF_JWT_SECRET || "dev-secret-change-me";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export function signStaffToken() {
  return jwt.sign({ staff: true }, SECRET, { expiresIn: MAX_AGE });
}

export function verifyStaffToken(token) {
  try {
    const payload = jwt.verify(token, SECRET);
    return !!payload.staff;
  } catch {
    return false;
  }
}

export function staffCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export function getStaffCookieName() {
  return COOKIE_NAME;
}

// Reads the request's cookies (App Router Request object) and returns true
// if a valid staff session is present. Use this inside every API route that
// changes data (POST / PUT / DELETE).
export function isStaffRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(COOKIE_NAME + "="));
  if (!match) return false;
  const token = decodeURIComponent(match.split("=").slice(1).join("="));
  return verifyStaffToken(token);
}
