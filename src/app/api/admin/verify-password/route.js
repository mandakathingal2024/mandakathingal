import bcrypt from 'bcryptjs';
import { getSessionFromRequest } from '../../../../lib/auth';
import { getAdminDb } from '../../../../lib/firebaseAdmin';

export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { currentPassword, adminId, username } = await request.json();

    const db = getAdminDb();
    const adminsRef = db.collection('admins');

    // Find admin doc
    let snap = await adminsRef.where('id', '==', adminId).get();
    if (snap.empty) {
      snap = await adminsRef.where('username', '==', username).get();
    }

    if (snap.empty) {
      return new Response(JSON.stringify({ valid: false, error: 'Admin not found' }), { status: 200 });
    }

    const admin = snap.docs[0].data();

    // Only accept bcrypt-hashed passwords
    let valid = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      valid = await bcrypt.compare(currentPassword, admin.password);
    }

    return new Response(JSON.stringify({ valid }), { status: 200 });
  } catch (error) {
    console.error('Verify password error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Server error' }), { status: 500 });
  }
}
