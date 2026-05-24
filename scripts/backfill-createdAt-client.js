#!/usr/bin/env node
/**
 * Backfill createdAt field for existing members using Firebase client SDK.
 * Usage: node scripts/backfill-createdAt-client.js [--dry-run]
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc, Timestamp } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const isDryRun = process.argv.includes('--dry-run');

async function backfill() {
  console.log(isDryRun ? '🔍 DRY RUN — scanning only\n' : '🚀 Backfilling createdAt...\n');

  const membersRef = collection(db, 'members');
  const snapshot = await getDocs(membersRef);

  let withDate = 0;
  let withoutDate = 0;
  let updated = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.createdAt) {
      withDate++;
    } else {
      withoutDate++;
      if (!isDryRun) {
        const docRef = doc(db, 'members', docSnap.id);
        await updateDoc(docRef, { createdAt: Timestamp.now() });
        updated++;
        console.log(`  ✅ ${data.name || data.id}`);
      } else {
        console.log(`  ⏳ ${data.name || data.id} — needs createdAt`);
      }
    }
  }

  console.log(`\n📊 Total: ${snapshot.size} members`);
  console.log(`   Already have createdAt: ${withDate}`);
  console.log(`   Missing createdAt: ${withoutDate}`);
  if (!isDryRun) console.log(`   Updated: ${updated}`);
  if (isDryRun) console.log('\nRun without --dry-run to apply changes.');

  process.exit(0);
}

backfill().catch((err) => { console.error(err); process.exit(1); });
