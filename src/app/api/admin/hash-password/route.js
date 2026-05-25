import bcrypt from 'bcryptjs';
import { getSessionFromRequest } from '../../../../lib/auth';

export async function POST(request) {
  // Verify admin session
  const session = getSessionFromRequest(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { password } = await request.json();
    if (!password || password.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters' }),
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    return new Response(JSON.stringify({ hashed }), { status: 200 });
  } catch (error) {
    console.error('Hash password error:', error);
    return new Response(JSON.stringify({ error: 'Failed to hash password' }), { status: 500 });
  }
}
