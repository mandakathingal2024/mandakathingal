import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../lib/firebaseAdmin';

/**
 * Returns the full members directory to an allow-listed family member.
 *
 * The signed-in Google user POSTs their Firebase ID token. We verify it, check
 * the email against the `gmail` allow-list with the Admin SDK, and — if allowed
 * — return every member document. This means the public members page does NOT
 * depend on a client-side Firebase custom claim (which is fragile in installed
 * PWAs and across the setCustomUserClaims propagation delay).
 *
 * Returns { authorized: boolean, members: [] }.
 */
function serializeValue(v) {
  if (v == null) return v;
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  if (Array.isArray(v)) return v.map(serializeValue);
  if (typeof v === 'object') {
    const o = {};
    for (const [k, val] of Object.entries(v)) o[k] = serializeValue(val);
    return o;
  }
  return v;
}

export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ authorized: false, members: [], error: 'No token' }, { status: 401 });
  }
  const idToken = authHeader.slice(7);

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase();
    if (!email) {
      return NextResponse.json({ authorized: false, members: [] }, { status: 200 });
    }

    const db = getAdminDb();

    // Allow-list check (server-side, authoritative)
    const gmailSnap = await db.collection('gmail').where('gmail', '==', email).limit(1).get();
    if (gmailSnap.empty) {
      return NextResponse.json({ authorized: false, members: [] }, { status: 200 });
    }

    // Return the full directory (client shape: id defaults to doc id, a custom
    // `id` field overrides it via the spread — same as the old client read).
    const mSnap = await db.collection('members').get();
    const members = mSnap.docs.map((d) => ({ id: d.id, ...serializeValue(d.data()) }));

    return NextResponse.json({ authorized: true, members }, { status: 200 });
  } catch (error) {
    console.error('members-data error:', error);
    return NextResponse.json({ authorized: false, members: [], error: 'Verification failed' }, { status: 401 });
  }
}
