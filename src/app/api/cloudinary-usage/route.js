import { NextResponse } from 'next/server';

export async function GET() {
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
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/usage`,
      {
        headers: { Authorization: `Basic ${auth}` },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!res.ok) {
      throw new Error(`Cloudinary API error: ${res.status}`);
    }

    const data = await res.json();

    // Extract the key usage info
    const usage = {
      storage: {
        used: data.storage?.usage || 0,        // bytes used
        limit: data.storage?.limit || 0,        // bytes limit
        usedFormatted: formatBytes(data.storage?.usage || 0),
        limitFormatted: formatBytes(data.storage?.limit || 0),
        percentage: data.storage?.limit
          ? Math.round((data.storage.usage / data.storage.limit) * 100)
          : 0,
      },
      bandwidth: {
        used: data.bandwidth?.usage || 0,
        limit: data.bandwidth?.limit || 0,
        usedFormatted: formatBytes(data.bandwidth?.usage || 0),
        limitFormatted: formatBytes(data.bandwidth?.limit || 0),
        percentage: data.bandwidth?.limit
          ? Math.round((data.bandwidth.usage / data.bandwidth.limit) * 100)
          : 0,
      },
      resources: data.resources || 0,
      plan: data.plan || 'Free',
    };

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Cloudinary usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
