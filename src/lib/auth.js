/**
 * Server-side auth helpers for API route protection.
 *
 * Admin sessions use a signed, httpOnly cookie (`admin_session`)
 * containing the admin id + sessionVersion. API routes call
 * `verifyAdmin(request)` to validate the cookie before proceeding.
 */

import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';
// SESSION_SECRET must be set in production — never fall back to public keys
const SECRET = process.env.SESSION_SECRET;
if (!SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET environment variable is required in production');
}
const SIGNING_KEY = SECRET || crypto.randomBytes(32).toString('hex'); // random key per cold start in dev

/**
 * Sign a payload into a tamper-proof token: base64(payload).base64(hmac)
 */
export function signToken(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hmac = crypto.createHmac('sha256', SIGNING_KEY).update(data).digest('base64');
  return `${data}.${hmac}`;
}

/**
 * Verify and decode a signed token. Returns null if invalid.
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [data, sig] = parts;
  const expected = crypto.createHmac('sha256', SIGNING_KEY).update(data).digest('base64');

  // Constant-time comparison to prevent timing attacks
  try {
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(data, 'base64').toString());
  } catch {
    return null;
  }
}

/**
 * Create a session cookie value for an admin.
 */
export function createSessionToken(admin) {
  return signToken({
    id: admin.id,
    role: admin.role,
    // Embedded so the server can enforce permissions without a DB lookup.
    // The token is HMAC-signed, so these cannot be tampered with client-side.
    permissions: admin.permissions || null,
    sessionVersion: admin.sessionVersion || 0,
    ts: Date.now(),
  });
}

/**
 * Verify the admin session cookie from a request.
 * Returns the decoded session payload or null.
 */
export function getSessionFromRequest(request) {
  let session = null;

  // Try cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (match) {
    session = verifyToken(decodeURIComponent(match[1]));
  }

  // Fallback: check Authorization header (for client-side API calls)
  if (!session) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      session = verifyToken(authHeader.slice(7));
    }
  }

  // Check token expiry (7 days max)
  if (session && session.ts) {
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - session.ts > MAX_AGE_MS) {
      return null; // Token expired
    }
  }

  return session;
}

/**
 * Build a Set-Cookie header value for the admin session.
 */
export function buildSessionCookie(token) {
  const maxAge = 7 * 24 * 60 * 60; // 7 days
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Secure`;
}

/**
 * Build a Set-Cookie header that clears the session.
 */
export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`;
}
