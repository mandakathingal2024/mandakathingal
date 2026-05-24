import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (reuse if already initialized)
function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

// Extract Cloudinary public_id from a secure_url
function extractPublicId(url) {
  try {
    // URL format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{folder}/{filename}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Fetch all resources from Cloudinary (handles pagination)
async function fetchAllCloudinaryResources(cloudName, auth) {
  const allResources = [];
  let nextCursor = null;

  do {
    const params = new URLSearchParams({ max_results: '500' });
    if (nextCursor) params.set('next_cursor', nextCursor);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?${params}`,
      { headers: { Authorization: `Basic ${auth}` } }
    );

    if (!res.ok) throw new Error(`Cloudinary API error: ${res.status}`);

    const data = await res.json();
    allResources.push(...(data.resources || []));
    nextCursor = data.next_cursor || null;
  } while (nextCursor);

  return allResources;
}

// Collect all image URLs from all Firestore collections
async function getAllImageUrls(db) {
  const imageUrls = new Set();

  const collections = [
    { name: 'members', fields: ['memberImgUrl', 'houseImgUrl'] },
    { name: 'gallery', fields: ['galleryImgUrl'] },
    { name: 'events', fields: ['eventImgUrl'] },
    { name: 'executives', fields: ['executiveImgUrl'] },
  ];

  for (const col of collections) {
    const snapshot = await db.collection(col.name).get();
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      col.fields.forEach((field) => {
        if (data[field] && typeof data[field] === 'string' && data[field].includes('cloudinary')) {
          imageUrls.add(data[field]);
        }
      });
    });
  }

  return imageUrls;
}

// GET: Scan and return orphaned images (dry run)
export async function GET() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 });
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const db = getAdminDb();

    const [cloudinaryResources, usedUrls] = await Promise.all([
      fetchAllCloudinaryResources(cloudName, auth),
      getAllImageUrls(db),
    ]);

    // Build a set of public_ids that are in use
    const usedPublicIds = new Set();
    usedUrls.forEach((url) => {
      const pid = extractPublicId(url);
      if (pid) usedPublicIds.add(pid);
    });

    // Find orphaned resources
    const orphans = cloudinaryResources.filter(
      (r) => !usedPublicIds.has(r.public_id)
    );

    return NextResponse.json({
      totalInCloudinary: cloudinaryResources.length,
      totalInUse: usedPublicIds.size,
      orphanCount: orphans.length,
      orphans: orphans.map((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
        bytes: r.bytes,
        created_at: r.created_at,
      })),
      totalOrphanBytes: orphans.reduce((sum, r) => sum + (r.bytes || 0), 0),
    });
  } catch (error) {
    console.error('Cleanup scan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scan' }, { status: 500 });
  }
}

// POST: Delete all orphaned images
export async function POST() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Cloudinary credentials not configured' }, { status: 500 });
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const db = getAdminDb();

    const [cloudinaryResources, usedUrls] = await Promise.all([
      fetchAllCloudinaryResources(cloudName, auth),
      getAllImageUrls(db),
    ]);

    const usedPublicIds = new Set();
    usedUrls.forEach((url) => {
      const pid = extractPublicId(url);
      if (pid) usedPublicIds.add(pid);
    });

    const orphans = cloudinaryResources.filter(
      (r) => !usedPublicIds.has(r.public_id)
    );

    if (orphans.length === 0) {
      return NextResponse.json({ deleted: 0, message: 'No orphaned images found' });
    }

    // Delete in batches of 100 (Cloudinary bulk delete limit)
    let totalDeleted = 0;
    for (let i = 0; i < orphans.length; i += 100) {
      const batch = orphans.slice(i, i + 100);
      const publicIds = batch.map((r) => r.public_id);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ public_ids: publicIds }),
        }
      );

      if (res.ok) {
        const result = await res.json();
        totalDeleted += Object.keys(result.deleted || {}).length;
      }
    }

    return NextResponse.json({
      deleted: totalDeleted,
      totalOrphanBytes: orphans.reduce((sum, r) => sum + (r.bytes || 0), 0),
      message: `Successfully deleted ${totalDeleted} orphaned images`,
    });
  } catch (error) {
    console.error('Cleanup delete error:', error);
    return NextResponse.json({ error: error.message || 'Failed to cleanup' }, { status: 500 });
  }
}
