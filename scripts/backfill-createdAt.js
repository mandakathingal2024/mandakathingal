#!/usr/bin/env node
/**
 * Backfill createdAt field for existing members that don't have one.
 * Sets createdAt to the current server timestamp.
 *
 * Usage: node scripts/backfill-createdAt.js [--dry-run]
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
require('dotenv').config();

// Initialize with project ID (uses Application Default Credentials or env)
const app = initializeApp({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

const isDryRun = process.argv.includes('--dry-run');

async function backfill() {
  console.log(isDryRun ? '🔍 DRY RUN — scanning only\n' : '🚀 Backfilling createdAt...\n');

  const membersRef = db.collection('members');
  const snapshot = await membersRef.get();

  let withDate = 0;
  let withoutDate = 0;
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.createdAt) {
      withDate++;
    } else {
      withoutDate++;
      if (!isDryRun) {
        await doc.ref.update({ createdAt: Timestamp.now() });
        updated++;
        process.stdout.write(`  ✅ ${data.name || data.id}\n`);
      } else {
        process.stdout.write(`  ⏳ ${data.name || data.id} — needs createdAt\n`);
      }
    }
  }

  console.log(`\n📊 Total: ${snapshot.size} members`);
  console.log(`   Already have createdAt: ${withDate}`);
  console.log(`   Missing createdAt: ${withoutDate}`);
  if (!isDryRun) console.log(`   Updated: ${updated}`);
  if (isDryRun) console.log('\nRun without --dry-run to apply changes.');
}

backfill().catch(console.error);
