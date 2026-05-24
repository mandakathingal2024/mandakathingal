#!/usr/bin/env node
/**
 * Migrate executive images from /public to Cloudinary.
 * Updates both executives and websiteContent collections in Firestore.
 *
 * Usage: node scripts/migrate-executive-images.js [--dry-run]
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, getDoc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const isDryRun = process.argv.includes('--dry-run');

// Map of local paths to track uploads (avoid duplicate uploads for same image)
const uploadCache = {};

async function uploadToCloudinary(localPath) {
  // Return cached URL if already uploaded
  if (uploadCache[localPath]) return uploadCache[localPath];

  const fullPath = path.join(PUBLIC_DIR, localPath.replace(/^\//, ''));

  if (!fs.existsSync(fullPath)) {
    console.log(`    ⚠️  File not found: ${fullPath}`);
    return null;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const blob = new Blob([fileBuffer]);
  const formData = new FormData();
  formData.append('file', blob, path.basename(localPath));
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${localPath}: ${errText}`);
  }

  const data = await res.json();
  uploadCache[localPath] = data.secure_url;
  return data.secure_url;
}

function isLocalPath(url) {
  return url && !url.startsWith('http') && !url.startsWith('data:');
}

async function migrate() {
  console.log(isDryRun ? '🔍 DRY RUN — scanning only\n' : '🚀 Migrating images to Cloudinary...\n');

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error('❌ Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
    process.exit(1);
  }

  // Step 1: Migrate executives collection
  console.log('📋 Step 1: Updating executives collection...\n');
  const execSnap = await getDocs(collection(db, 'executives'));
  let execUpdated = 0;

  for (const docSnap of execSnap.docs) {
    const data = docSnap.data();
    const imgUrl = data.executiveImgUrl;

    if (isLocalPath(imgUrl)) {
      console.log(`  📸 ${data.name} — ${imgUrl}`);
      if (!isDryRun) {
        const cloudinaryUrl = await uploadToCloudinary(imgUrl);
        if (cloudinaryUrl) {
          await updateDoc(docSnap.ref, { executiveImgUrl: cloudinaryUrl });
          console.log(`     ✅ → ${cloudinaryUrl}`);
          execUpdated++;
        }
      } else {
        console.log(`     ⏳ Would upload ${imgUrl}`);
        execUpdated++;
      }
    } else {
      console.log(`  ⏭️  ${data.name} — already on Cloudinary`);
    }
  }

  console.log(`\n📊 Executives: ${execUpdated} images migrated\n`);

  // Step 2: Migrate websiteContent collection
  console.log('📋 Step 2: Updating websiteContent collection...\n');
  const sectionIds = ['editorial', 'advisoryBoard', 'committee'];
  let contentUpdated = 0;

  for (const sectionId of sectionIds) {
    const docRef = doc(db, 'websiteContent', sectionId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      console.log(`  ⏭️  ${sectionId} — not found, skipping`);
      continue;
    }

    const data = snap.data();
    const members = data.members || [];
    let sectionChanged = false;

    console.log(`  📂 ${sectionId} (${members.length} members)`);

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      if (isLocalPath(member.img)) {
        console.log(`     📸 ${member.name} — ${member.img}`);
        if (!isDryRun) {
          const cloudinaryUrl = await uploadToCloudinary(member.img);
          if (cloudinaryUrl) {
            members[i] = { ...member, img: cloudinaryUrl };
            sectionChanged = true;
            console.log(`        ✅ → ${cloudinaryUrl}`);
            contentUpdated++;
          }
        } else {
          console.log(`        ⏳ Would upload ${member.img}`);
          contentUpdated++;
        }
      } else {
        console.log(`     ⏭️  ${member.name} — already on Cloudinary`);
      }
    }

    if (sectionChanged && !isDryRun) {
      await setDoc(docRef, { ...data, members });
      console.log(`     💾 ${sectionId} saved\n`);
    }
  }

  console.log(`📊 Website content: ${contentUpdated} images migrated\n`);

  // Step 3: List local files that can be removed
  const localFiles = new Set(Object.keys(uploadCache));
  if (localFiles.size > 0) {
    console.log('🗑️  Local files that can now be deleted from /public:');
    localFiles.forEach((f) => console.log(`   ${f}`));
  }

  console.log('\n✨ Done!');
  if (isDryRun) console.log('\nRun without --dry-run to apply changes.');
  process.exit(0);
}

migrate().catch((err) => { console.error(err); process.exit(1); });
