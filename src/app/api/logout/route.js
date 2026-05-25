import { clearSessionCookie } from '../../../lib/auth';

export async function POST() {
  const response = new Response(JSON.stringify({ success: true }), { status: 200 });
  response.headers.set('Set-Cookie', clearSessionCookie());
  return response;
}
