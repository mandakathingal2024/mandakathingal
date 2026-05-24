#!/usr/bin/env node
/**
 * Seed the 8 hardcoded activities & milestones into the Firestore events collection.
 * Uploads gallery images from /public to Cloudinary first.
 *
 * Usage: node scripts/seed-events.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');
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

const uploadCache = {};

async function uploadToCloudinary(localPath) {
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
  console.log(`    ✅ Uploaded ${localPath} → ${data.secure_url}`);
  uploadCache[localPath] = data.secure_url;
  return data.secure_url;
}

// ─── Data to seed ───────────────────────────────────────────────────────────

const recentActivities = [
  {
    img: '/gallery/img-1.jpeg',
    title: 'Annual Family Gathering 2024',
    titleMl: 'വാര്‍ഷിക കുടുംബ സംഗമം 2024',
    description: 'Over 150 family members came together for a memorable day of reunion, cultural programs, and strengthening family bonds.',
    descMl: 'കുടുംബ ബന്ധങ്ങൾ ശക്തിപ്പെടുത്തുന്ന ഒരു അവിസ്മരണീയ ദിനത്തിനായി 150-ലധികം കുടുംബാംഗങ്ങൾ ഒത്തുചേർന്നു.',
  },
  {
    img: '/gallery/home-1.jpg',
    title: 'Heritage Preservation Workshop',
    titleMl: 'പൈതൃക സംരക്ഷണ ശിൽപശാല',
    description: 'Workshop on documenting and preserving our family history and traditions for future generations.',
    descMl: 'ഭാവി തലമുറകൾക്കായി നമ്മുടെ കുടുംബ ചരിത്രവും പാരമ്പര്യവും രേഖപ്പെടുത്തുന്ന ശിൽപശാല.',
  },
  {
    img: '/gallery/img-5.jpeg',
    title: 'Community Welfare Drive',
    titleMl: 'സമൂഹ ക്ഷേമ പ്രവർത്തനം',
    description: 'Annual community health outreach and charity program organized by the association.',
    descMl: 'സമിതിയുടെ വാർഷിക ആരോഗ്യ, ജീവകാരുണ്യ പരിപാടി.',
  },
  {
    img: '/gallery/img-8.jpeg',
    title: 'Cultural Celebration',
    titleMl: 'സാംസ്കാരിക ആഘോഷം',
    description: 'A vibrant celebration bringing together traditions, food, and festivities.',
    descMl: 'പാരമ്പര്യവും ഭക്ഷണവും ഉത്സവങ്ങളും ഒത്തുചേരുന്ന ഉത്സവാഘോഷം.',
  },
];

const familyMilestones = [
  {
    img: '/gallery/home-2.jpg',
    title: 'Association Founded',
    titleMl: 'സമിതി സ്ഥാപിതം',
    category: 'Foundation',
    categoryMl: 'സ്ഥാപനം',
    year: '2009',
    description: 'Mandakathingal Family Association was officially formed to unite and serve the family community.',
    descMl: 'കുടുംബ സമൂഹത്തെ ഒന്നിപ്പിക്കാനും സേവിക്കാനും മണ്ടകത്തിങ്ങൽ കുടുംബ സമിതി ഔദ്യോഗികമായി രൂപീകരിച്ചു.',
  },
  {
    img: '/gallery/img-3.jpeg',
    title: 'First Grand Reunion',
    titleMl: 'ആദ്യ മഹാ സംഗമം',
    category: 'Reunion',
    categoryMl: 'സംഗമം',
    year: '2012',
    description: 'The first large-scale family reunion brought together over 100 members from different branches.',
    descMl: 'ആദ്യ വലിയ തോതിലുള്ള കുടുംബ സംഗമം വ്യത്യസ്ത ശാഖകളിൽ നിന്ന് 100-ലധികം അംഗങ്ങളെ ഒത്തുചേർത്തു.',
  },
  {
    img: '/gallery/img-6.jpeg',
    title: 'Suvaneer Published',
    titleMl: 'സുവനീർ പ്രസിദ്ധീകരണം',
    category: 'Publication',
    categoryMl: 'പ്രസിദ്ധീകരണം',
    year: '2024',
    description: 'Family souvenir documenting our heritage, history, and memorable moments was published.',
    descMl: 'നമ്മുടെ പൈതൃകവും ചരിത്രവും അവിസ്മരണീയ നിമിഷങ്ങളും രേഖപ്പെടുത്തുന്ന കുടുംബ സുവനീർ പ്രസിദ്ധീകരിച്ചു.',
  },
  {
    img: '/gallery/beach-1.jpg',
    title: '150+ Members Strong',
    titleMl: '150+ അംഗങ്ങൾ',
    category: 'Growth',
    categoryMl: 'വളർച്ച',
    year: '2024',
    description: 'Our association crossed the milestone of 150 registered family members across multiple branches.',
    descMl: 'നമ്മുടെ സമിതി 150 രജിസ്‌ട്രേഡ് കുടുംബാംഗങ്ങളുടെ നാഴികക്കല്ല് പിന്നിട്ടു.',
  },
];

async function seed() {
  console.log('🚀 Seeding events with Cloudinary image uploads...\n');

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error('❌ Missing CLOUDINARY env vars. Check .env');
    process.exit(1);
  }

  const eventsRef = collection(db, 'events');

  // Seed Recent Activities
  console.log('📌 Seeding Recent Activities (4 events)...');
  for (const item of recentActivities) {
    const cloudUrl = await uploadToCloudinary(item.img);
    if (!cloudUrl) {
      console.log(`    ⚠️  Skipping ${item.title} (image upload failed)`);
      continue;
    }
    const docData = {
      id: uuidv4(),
      eventImgUrl: cloudUrl,
      title: item.title,
      titleMl: item.titleMl,
      description: item.description,
      descMl: item.descMl,
      displaySection: 'recentActivities',
      category: '',
      categoryMl: '',
      year: '',
      createdAt: serverTimestamp(),
    };
    await addDoc(eventsRef, docData);
    console.log(`    ✅ Added: ${item.title}`);
  }

  // Seed Family Milestones
  console.log('\n📌 Seeding Family Milestones (4 events)...');
  for (const item of familyMilestones) {
    const cloudUrl = await uploadToCloudinary(item.img);
    if (!cloudUrl) {
      console.log(`    ⚠️  Skipping ${item.title} (image upload failed)`);
      continue;
    }
    const docData = {
      id: uuidv4(),
      eventImgUrl: cloudUrl,
      title: item.title,
      titleMl: item.titleMl,
      description: item.description,
      descMl: item.descMl,
      displaySection: 'familyMilestones',
      category: item.category,
      categoryMl: item.categoryMl,
      year: item.year,
      createdAt: serverTimestamp(),
    };
    await addDoc(eventsRef, docData);
    console.log(`    ✅ Added: ${item.title}`);
  }

  console.log('\n✅ All 8 events seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
