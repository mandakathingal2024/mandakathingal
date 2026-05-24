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

    // Free plan defaults: 25 GB storage, 25 GB bandwidth
    const FREE_STORAGE_LIMIT = 25 * 1024 * 1024 * 1024; // 25 GB in bytes
    const FREE_BANDWIDTH_LIMIT = 25 * 1024 * 1024 * 1024; // 25 GB in bytes

    const storageUsed = data.storage?.usage || 0;
    const storageLimit = data.storage?.limit || FREE_STORAGE_LIMIT;
    const bandwidthUsed = data.bandwidth?.usage || 0;
    const bandwidthLimit = data.bandwidth?.limit || FREE_BANDWIDTH_LIMIT;

    // Extract the key usage info
    const usage = {
      storage: {
        used: storageUsed,
        limit: storageLimit,
        usedFormatted: formatBytes(storageUsed),
        limitFormatted: formatBytes(storageLimit),
        percentage: Math.round((storageUsed / storageLimit) * 100),
      },
      bandwidth: {
        used: bandwidthUsed,
        limit: bandwidthLimit,
        usedFormatted: formatBytes(bandwidthUsed),
        limitFormatted: formatBytes(bandwidthLimit),
        percentage: Math.round((bandwidthUsed / bandwidthLimit) * 100),
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
