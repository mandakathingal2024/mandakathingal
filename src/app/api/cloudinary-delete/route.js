import { NextResponse } from 'next/server';

export async function POST(request) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: 'Cloudinary credentials not configured' },
      { status: 500 }
    );
  }

  try {
    const { publicId } = await request.json();

    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId is required' },
        { status: 400 }
      );
    }

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload/${publicId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `Cloudinary API error: ${res.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
