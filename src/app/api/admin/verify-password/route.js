import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { getSessionFromRequest } from '../../../../lib/auth';

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
  const existing = apps.find((a) => a.name === 'server-verify');
  if (existing) return getFirestore(existing);
  const app = initializeApp(firebaseConfig, 'server-verify');
  return getFirestore(app);
}

export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { currentPassword, adminId, username } = await request.json();

    const db = getDb();
    const adminsRef = collection(db, 'admins');

    // Find admin doc
    let snap = await getDocs(query(adminsRef, where('id', '==', adminId)));
    if (snap.empty) {
      snap = await getDocs(query(adminsRef, where('username', '==', username)));
    }

    if (snap.empty) {
      return new Response(JSON.stringify({ valid: false, error: 'Admin not found' }), { status: 200 });
    }

    const admin = snap.docs[0].data();

    let valid = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      valid = await bcrypt.compare(currentPassword, admin.password);
    } else {
      valid = admin.password === currentPassword;
    }

    return new Response(JSON.stringify({ valid }), { status: 200 });
  } catch (error) {
    console.error('Verify password error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Server error' }), { status: 500 });
  }
}
