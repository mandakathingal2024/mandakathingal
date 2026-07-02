// lib/firebaseConfig.js
//
// NOTE: The shared app context (stateContext) does NOT import this file
// statically — it loads Firebase lazily so the SDK stays out of the shared
// bundle and public pages that never touch member data don't download it.
// Components that DO import this file (admin dashboard, home content, member
// family view) pull Firebase into their own route chunk, which is expected.

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

// Async getters used by the lazily-loaded context path.
export async function getDb() { return db; }
export async function getAuthInstance() { return auth; }
