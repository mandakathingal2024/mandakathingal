import { getSessionFromRequest } from '../../../lib/auth';
import { getAdminAuth } from '../../../lib/firebaseAdmin';

/**
 * Mint a Firebase custom token for the currently authenticated admin.
 *
 * The admin username/password login only creates a custom HMAC session — it
 * does NOT create a Firebase Auth session. But the dashboard reads protected
 * collections (members, admins, gmail, activityLog) via the client SDK, which
 * require request.auth != null. This endpoint lets the client sign in to
 * Firebase (signInWithCustomToken) using the existing admin session, so reads
 * work on any device right after login — no Google sign-in needed.
 */
export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const uid = `admin_${session.id}`;
    const token = await getAdminAuth().createCustomToken(uid, { admin: true });
    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    console.error('Firebase token error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Server error' }), { status: 500 });
  }
}
