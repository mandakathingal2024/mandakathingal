'use server'
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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

export async function POST(request) {
  const req = await request.json();

  try {
    const db = getDb();
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where('username', '==', req.userName));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const admin = snapshot.docs[0].data();

      if (admin.password === req.password && admin.isActive !== false) {
        const data = {
          isAuthenticated: true,
          admin: {
            id: admin.id,
            name: admin.name,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions || { add: true, edit: true, view: true, delete: true },
            sessionVersion: admin.sessionVersion || 0,
          },
        };
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }

    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  }
}
