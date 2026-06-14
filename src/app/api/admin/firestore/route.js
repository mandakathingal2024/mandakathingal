import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getSessionFromRequest } from '../../../../lib/auth';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

// Allowed collections for admin writes
const ALLOWED_COLLECTIONS = [
  'members', 'events', 'gallery', 'executives',
  'websiteContent', 'gmail', 'admins', 'activityLog',
];

// Maps each collection to the dashboard "page" it belongs to. A non-superAdmin
// can only write to a collection if that page is in their visiblePages list.
const COLLECTION_PAGE = {
  gallery: 1, members: 2, events: 3, executives: 4,
  gmail: 5, websiteContent: 6, admins: 7,
};

// Maps a write action to the permission flag it requires.
const ACTION_PERMISSION = {
  add: 'add', set: 'edit', update: 'edit',
  delete: 'delete', deleteRecursive: 'delete',
};

/**
 * Authorize a write based on the admin's role + permissions (carried in the
 * signed, tamper-proof session token). Returns { ok } or { ok:false, status, error }.
 */
function authorizeWrite(session, action, collectionName) {
  const role = session.role;

  // Super Admins can do everything
  if (role === 'superAdmin') return { ok: true };

  // activityLog: any authenticated admin may append their own activity entries
  if (collectionName === 'activityLog') {
    if (action === 'add') return { ok: true };
    return { ok: false, status: 403, error: 'Not allowed' };
  }

  // Admin management is restricted to Super Admins
  if (collectionName === 'admins') {
    return { ok: false, status: 403, error: 'Admin management is restricted to Super Admins' };
  }

  // Legacy token issued before permissions were embedded — force a re-login
  // so the admin gets a token carrying their permissions.
  if (!session.permissions) {
    return { ok: false, status: 401, error: 'Session expired. Please log in again.' };
  }

  const perms = session.permissions;

  // Section access: the collection's page must be in the admin's visiblePages
  const page = COLLECTION_PAGE[collectionName];
  if (page && !(perms.visiblePages || []).includes(page)) {
    return { ok: false, status: 403, error: 'You do not have access to this section' };
  }

  // Action permission: add/edit/delete must be granted
  const permKey = ACTION_PERMISSION[action];
  if (permKey && !perms[permKey]) {
    return { ok: false, status: 403, error: `You do not have permission to ${permKey === 'edit' ? 'edit' : permKey} here` };
  }

  return { ok: true };
}

/**
 * Server-side proxy for admin Firestore writes.
 * All writes are authenticated via the admin session cookie/token.
 * This allows Firestore rules to deny direct client-side writes.
 *
 * Supported actions:
 *   add    — add a new document
 *   update — update an existing document (found by custom 'id' field)
 *   delete — delete a document (found by custom 'id' field)
 *   deleteRecursive — delete a member and all related members
 */
export async function POST(request) {
  // Verify admin session
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { action, collection: collectionName, data, id } = body;

  // Validate collection name
  if (!collectionName || !ALLOWED_COLLECTIONS.includes(collectionName)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
  }

  // Validate action
  if (!['add', 'set', 'update', 'delete', 'deleteRecursive'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Enforce role/permission for this action + collection
  const authz = authorizeWrite(session, action, collectionName);
  if (!authz.ok) {
    return NextResponse.json({ error: authz.error }, { status: authz.status });
  }

  try {
    const db = getAdminDb();
    const colRef = db.collection(collectionName);

    switch (action) {
      case 'add': {
        if (!data || typeof data !== 'object') {
          return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }
        // Replace serverTimestamp placeholder with actual server timestamp
        const processedData = replaceTimestamps(data);
        const docRef = await colRef.add(processedData);
        return NextResponse.json({ success: true, docId: docRef.id });
      }

      case 'set': {
        // Set a document with a specific Firestore document ID (e.g., websiteContent/heroBanner)
        if (!data || !id) {
          return NextResponse.json({ error: 'Missing data or id' }, { status: 400 });
        }
        const processedSetData = replaceTimestamps(data);
        await colRef.doc(id).set(processedSetData);
        return NextResponse.json({ success: true });
      }

      case 'update': {
        if (!data || !id) {
          return NextResponse.json({ error: 'Missing data or id' }, { status: 400 });
        }
        const processedData = replaceTimestamps(data);
        // Find document by custom 'id' field
        const snap = await colRef.where('id', '==', id).limit(1).get();
        if (snap.empty) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        await snap.docs[0].ref.update(processedData);
        return NextResponse.json({ success: true });
      }

      case 'delete': {
        if (!id) {
          return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }
        // Try to find the document by its custom 'id' field first
        const snap = await colRef.where('id', '==', id).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.delete();
          return NextResponse.json({ success: true });
        }
        // Fall back: treat the id as the Firestore document ID.
        // Needed for docs seeded manually (e.g. admins) that lack a custom id field.
        const byDocId = colRef.doc(id);
        const docSnap = await byDocId.get();
        if (docSnap.exists) {
          await byDocId.delete();
          return NextResponse.json({ success: true });
        }
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      case 'deleteRecursive': {
        // Delete a member and all members related to it (cascading)
        if (!id || collectionName !== 'members') {
          return NextResponse.json({ error: 'deleteRecursive only works on members' }, { status: 400 });
        }
        await deleteRecursively(db, id);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin Firestore error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

/**
 * Recursively delete a member and all members related to it.
 */
async function deleteRecursively(db, memberId) {
  const colRef = db.collection('members');

  // Delete the member itself
  const snap = await colRef.where('id', '==', memberId).limit(1).get();
  if (!snap.empty) {
    await snap.docs[0].ref.delete();
  }

  // Find and delete all members related to this one
  const relatedSnap = await colRef.where('relatedTo', '==', memberId).get();
  for (const doc of relatedSnap.docs) {
    const relatedId = doc.data().id;
    if (relatedId) {
      await deleteRecursively(db, relatedId);
    }
  }
}

/**
 * Replace { _serverTimestamp: true } markers with actual FieldValue.serverTimestamp()
 * because serverTimestamp() can't be serialized over JSON.
 */
function replaceTimestamps(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (obj._serverTimestamp === true) {
    return FieldValue.serverTimestamp();
  }

  if (Array.isArray(obj)) {
    return obj.map(replaceTimestamps);
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = replaceTimestamps(value);
  }
  return result;
}
