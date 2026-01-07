import { cookies } from "next/headers";
import { randomBytes, createHmac } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || "default-csrf-secret-change-in-production";
const CSRF_TOKEN_COOKIE = "csrf_token";
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

interface TokenData {
  value: string;
  timestamp: number;
}

/**
 * Generate a CSRF token and store it in a cookie
 */
export async function generateToken(): Promise<string> {
  const tokenValue = randomBytes(32).toString("hex");
  const timestamp = Date.now();

  const tokenData: TokenData = { value: tokenValue, timestamp };
  const signature = signToken(tokenData);

  const token = `${Buffer.from(JSON.stringify(tokenData)).toString("base64")}.${signature}`;

  // Store in HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: TOKEN_EXPIRY / 1000,
    path: "/",
  });

  return tokenValue;
}

/**
 * Verify a CSRF token against the stored cookie
 */
export async function verifyToken(token: string | null): Promise<boolean> {
  if (!token) return false;

  const cookieStore = await cookies();
  const storedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;

  if (!storedToken) return false;

  try {
    const [encodedData, signature] = storedToken.split(".");
    const tokenData: TokenData = JSON.parse(
      Buffer.from(encodedData, "base64").toString()
    );

    // Verify signature
    const expectedSignature = signToken(tokenData);
    if (signature !== expectedSignature) return false;

    // Check expiry
    if (Date.now() - tokenData.timestamp > TOKEN_EXPIRY) return false;

    // Compare tokens
    return timingSafeEqual(token, tokenData.value);
  } catch {
    return false;
  }
}

/**
 * Sign token data with HMAC
 */
function signToken(data: TokenData): string {
  return createHmac("sha256", CSRF_SECRET)
    .update(JSON.stringify(data))
    .digest("hex");
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Middleware helper to check CSRF token
 */
export async function validateCsrfToken(request: Request): Promise<{ valid: boolean; error?: string }> {
  const token = request.headers.get("X-CSRF-Token");

  if (!token) {
    return { valid: false, error: "Missing CSRF token" };
  }

  const isValid = await verifyToken(token);

  if (!isValid) {
    return { valid: false, error: "Invalid or expired CSRF token" };
  }

  return { valid: true };
}

export const csrf = {
  generateToken,
  verifyToken,
  validateCsrfToken,
};
