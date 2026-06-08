/**
 * Shared Firebase Admin SDK initialization.
 *
 * On Vercel / production, reads the service account key from the
 * FIREBASE_SERVICE_ACCOUNT_KEY environment variable (JSON string).
 * Falls back to Application Default Credentials (for GCP environments).
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let _db = null;

export function getAdminDb() {
  if (_db) return _db;

  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      // Vercel / production: use service account key from env var
      try {
        const parsed = JSON.parse(serviceAccountKey);
        initializeApp({ credential: cert(parsed) });
      } catch (e) {
        console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
        // Fall back to projectId-only init
        initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
      }
    } else {
      // Local dev or GCP: rely on ADC or projectId
      initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
    }
  }

  _db = getFirestore();
  return _db;
}
