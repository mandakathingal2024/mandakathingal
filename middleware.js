import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SESSION_COOKIE = 'admin_session';

/**
 * Lightweight middleware to protect admin routes.
 * Verifies the admin session cookie exists and has a valid HMAC signature.
 * This runs at the edge before the page is served.
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect the admin dashboard (not the login page itself)
  if (pathname.startsWith('/mkadminhamza/dashboard')) {
    const cookieValue = request.cookies.get(SESSION_COOKIE)?.value;

    if (!cookieValue) {
      // No session cookie — redirect to admin login
      return NextResponse.redirect(new URL('/mkadminhamza', request.url));
    }

    // Quick structural check: token should be base64.base64
    const parts = cookieValue.split('.');
    if (parts.length !== 2) {
      return NextResponse.redirect(new URL('/mkadminhamza', request.url));
    }

    // Verify HMAC if SESSION_SECRET is available at the edge
    const secret = process.env.SESSION_SECRET;
    if (secret) {
      try {
        const [data, sig] = parts;
        const expected = crypto
          .createHmac('sha256', secret)
          .update(data)
          .digest('base64');

        const sigBuf = Buffer.from(sig);
        const expectedBuf = Buffer.from(expected);

        if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
          // Invalid signature — session tampered
          const response = NextResponse.redirect(new URL('/mkadminhamza', request.url));
          response.cookies.delete(SESSION_COOKIE);
          return response;
        }

        // Check token expiry
        try {
          const payload = JSON.parse(Buffer.from(data, 'base64').toString());
          if (payload.ts && Date.now() - payload.ts > 7 * 24 * 60 * 60 * 1000) {
            const response = NextResponse.redirect(new URL('/mkadminhamza', request.url));
            response.cookies.delete(SESSION_COOKIE);
            return response;
          }
        } catch {
          // Malformed payload
          return NextResponse.redirect(new URL('/mkadminhamza', request.url));
        }
      } catch {
        // Crypto error — reject
        return NextResponse.redirect(new URL('/mkadminhamza', request.url));
      }
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    // Admin dashboard routes
    '/mkadminhamza/dashboard/:path*',
    // Apply security headers to all pages (exclude static files & API)
    '/((?!_next/static|_next/image|favicon.ico|m.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
