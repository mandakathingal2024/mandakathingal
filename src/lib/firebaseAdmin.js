/**
 * Shared Firebase Admin SDK initialization.
 *
 * On Vercel / production, reads the service account key from the
 * FIREBASE_SERVICE_ACCOUNT_KEY environment variable (JSON string).
 * Falls back to Application Default Credentials (for GCP environments).
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let _db = null;

// Ensure the Firebase Admin app is initialized exactly once.
function ensureAdminApp() {
  if (getApps().length > 0) return;

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    // Vercel / production: use service account key from env var
    try {
      const parsed = JSON.parse(serviceAccountKey);
      initializeApp({ credential: cert(parsed) });
      return;
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
    }
  }
  // Local dev or GCP: rely on ADC or projectId
  initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
}

export function getAdminDb() {
  if (_db) return _db;
  ensureAdminApp();
  _db = getFirestore();
  return _db;
}

// Firebase Admin Auth — used to mint custom tokens so admins get a real
// Firebase Auth session (request.auth != null) for client-side reads,
// without needing a separate Google sign-in on each device.
export function getAdminAuth() {
  ensureAdminApp();
  return getAuth();
}
