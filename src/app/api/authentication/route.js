'use server'
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID });
  }
  return getFirestore();
}

export async function POST(request) {
  const req = await request.json();

  try {
    const db = getAdminDb();
    const adminsRef = db.collection('admins');
    const snapshot = await adminsRef.where('username', '==', req.userName).get();

    if (!snapshot.empty) {
      const adminDoc = snapshot.docs[0];
      const admin = adminDoc.data();

      if (admin.password === req.password && admin.isActive !== false) {
        const { password, ...adminInfo } = admin;
        const data = {
          isAuthenticated: true,
          admin: {
            id: admin.id,
            name: admin.name,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions || { add: true, edit: true, view: true, delete: true },
          },
        };
        return new Response(JSON.stringify(data), { status: 200 });
      }
    }

    // Fallback: check env vars (for backward compatibility before seed)
    const userName = process.env.USER_NAME;
    const password = process.env.PASSWORD;
    if (userName === req.userName && password === req.password) {
      const data = {
        isAuthenticated: true,
        admin: {
          id: 'env-super-admin',
          name: 'Super Admin',
          username: req.userName,
          role: 'superAdmin',
          permissions: { add: true, edit: true, view: true, delete: true },
        },
      };
      return new Response(JSON.stringify(data), { status: 200 });
    }

    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  } catch (error) {
    console.error('Authentication error:', error);

    // If Firestore fails, fall back to env var check
    const userName = process.env.USER_NAME;
    const password = process.env.PASSWORD;
    if (userName === req.userName && password === req.password) {
      const data = {
        isAuthenticated: true,
        admin: {
          id: 'env-super-admin',
          name: 'Super Admin',
          username: req.userName,
          role: 'superAdmin',
          permissions: { add: true, edit: true, view: true, delete: true },
        },
      };
      return new Response(JSON.stringify(data), { status: 200 });
    }

    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  }
}
