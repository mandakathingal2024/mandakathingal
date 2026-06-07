import { NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getSessionFromRequest } from '../../../../lib/auth';

// Initialize Firebase Admin (reuse if already initialized)
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

// Allowed collections for admin writes
const ALLOWED_COLLECTIONS = [
  'members', 'events', 'gallery', 'executives',
  'websiteContent', 'gmail', 'admins', 'activityLog',
];

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
        const snap = await colRef.where('id', '==', id).limit(1).get();
        if (!snap.empty) {
          await snap.docs[0].ref.delete();
        }
        return NextResponse.json({ success: true });
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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
