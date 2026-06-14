import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '../../../lib/firebaseAdmin';

/**
 * Server-side enforcement of the members directory allow-list.
 *
 * A signed-in Google user POSTs their Firebase ID token here. We verify it,
 * check the email against the `gmail` allow-list with the Admin SDK, and — if
 * allowed — grant a `member: true` custom claim. Firestore rules can then
 * require that claim to read the `members` collection, so the allow-list is a
 * real security boundary instead of a client-side UI check.
 *
 * Returns { authorized: boolean }.
 */
export async function POST(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ authorized: false, error: 'No token' }, { status: 401 });
  }
  const idToken = authHeader.slice(7);

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase();
    if (!email) {
      return NextResponse.json({ authorized: false }, { status: 200 });
    }

    // Authoritative allow-list check (server-side)
    const db = getAdminDb();
    const snap = await db.collection('gmail').where('gmail', '==', email).limit(1).get();
    const authorized = !snap.empty;

    // Grant or revoke the `member` claim to match the allow-list
    const user = await auth.getUser(decoded.uid);
    const existing = user.customClaims || {};
    if (authorized && existing.member !== true) {
      await auth.setCustomUserClaims(decoded.uid, { ...existing, member: true });
    } else if (!authorized && existing.member === true) {
      const { member, ...rest } = existing;
      await auth.setCustomUserClaims(decoded.uid, rest);
    }

    return NextResponse.json({ authorized }, { status: 200 });
  } catch (error) {
    console.error('member-access error:', error);
    return NextResponse.json({ authorized: false, error: 'Verification failed' }, { status: 401 });
  }
}
