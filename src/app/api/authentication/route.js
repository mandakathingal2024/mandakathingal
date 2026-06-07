'use server'
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { createSessionToken, buildSessionCookie } from '../../../lib/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getDb() {
  const apps = getApps();
  const existing = apps.find((a) => a.name === 'server-auth');
  if (existing) return getFirestore(existing);
  const app = initializeApp(firebaseConfig, 'server-auth');
  return getFirestore(app);
}

// Simple in-memory rate limiter (resets on serverless cold start)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(username) {
  const key = username.toLowerCase();
  const record = loginAttempts.get(key);
  if (!record) return { allowed: true };

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return { allowed: false, remainingSec };
  }

  // Reset if lockout expired
  if (record.lockedUntil && Date.now() >= record.lockedUntil) {
    loginAttempts.delete(key);
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
    return { allowed: false, remainingSec: Math.ceil(LOCKOUT_MS / 1000) };
  }

  return { allowed: true };
}

function recordFailedAttempt(username) {
  const key = username.toLowerCase();
  const record = loginAttempts.get(key) || { count: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  loginAttempts.set(key, record);
}

function clearAttempts(username) {
  loginAttempts.delete(username.toLowerCase());
}

export async function POST(request) {
  const req = await request.json();

  if (!req.userName || !req.password) {
    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  }

  // Rate limit check
  const rateCheck = checkRateLimit(req.userName);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        isAuthenticated: false,
        error: `Too many login attempts. Please try again in ${rateCheck.remainingSec} seconds.`,
        locked: true,
      }),
      { status: 429 }
    );
  }

  try {
    const db = getDb();
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('username', '==', req.userName));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const adminDoc = snapshot.docs[0];
      const admin = adminDoc.data();

      if (admin.isActive === false) {
        recordFailedAttempt(req.userName);
        return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
      }

      // Only accept bcrypt-hashed passwords — plaintext fallback removed for security
      let passwordValid = false;
      if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
        passwordValid = await bcrypt.compare(req.password, admin.password);
      }
      // If password is not hashed, login fails — admin must contact superAdmin to reset

      if (passwordValid) {
        clearAttempts(req.userName);

        const adminData = {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
          permissions: admin.permissions || { add: true, edit: true, view: true, delete: true },
          sessionVersion: admin.sessionVersion || 0,
        };

        // Create signed session token
        const token = createSessionToken(adminData);

        const data = {
          isAuthenticated: true,
          admin: adminData,
          token, // Client stores this for API calls
        };

        const response = new Response(JSON.stringify(data), { status: 200 });
        response.headers.set('Set-Cookie', buildSessionCookie(token));
        return response;
      }
    }

    recordFailedAttempt(req.userName);
    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  }
}
