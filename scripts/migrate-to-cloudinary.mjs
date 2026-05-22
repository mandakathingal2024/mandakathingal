/**
 * Migration script: Firebase Storage → Cloudinary
 *
 * Reads all Firestore documents, downloads images from Firebase Storage URLs,
 * re-uploads them to Cloudinary, and updates Firestore with new URLs.
 *
 * Usage: node scripts/migrate-to-cloudinary.mjs
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import https from 'https';
import http from 'http';
import FormData from 'form-data';

// ─── Config ───
const firebaseConfig = {
  apiKey: "AIzaSyBUy9-I04AJwPu1D7e-PaEtDFKlL1zRafE",
  authDomain: "mandakathingal-a4893.firebaseapp.com",
  projectId: "mandakathingal-a4893",
  storageBucket: "mandakathingal-a4893.appspot.com",
  messagingSenderId: "157420949531",
  appId: "1:157420949531:web:bf3bf44b8e1cf4fb61a8be"
};

const CLOUD_NAME = "dj5phrlqi";
const UPLOAD_PRESET = "Mandakathingal";

// ─── Collections and their image fields ───
const COLLECTIONS = [
  { name: 'members', fields: ['memberImgUrl', 'houseImgUrl'] },
  { name: 'gallery', fields: ['galleryImgUrl'] },
  { name: 'events', fields: ['eventImgUrl'] },
  { name: 'executives', fields: ['executiveImgUrl'] },
];

// ─── Initialize Firebase ───
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── Helper: Download image from URL as Buffer ───
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── Helper: Upload buffer to Cloudinary ───
function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', buffer, { filename: 'image.jpg', contentType: 'image/jpeg' });
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('folder', folder);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: form.getHeaders(),
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.secure_url) {
            resolve(json.secure_url);
          } else {
            reject(new Error(`Cloudinary error: ${JSON.stringify(json)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${data}`));
        }
      });
    });

    req.on('error', reject);
    form.pipe(req);
  });
}

// ─── Check if URL is a Firebase Storage URL ───
function isFirebaseUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('firebasestorage.googleapis.com');
}

// ─── Main Migration ───
async function migrate() {
  console.log('🚀 Starting migration: Firebase Storage → Cloudinary\n');

  let totalProcessed = 0;
  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  for (const col of COLLECTIONS) {
    console.log(`\n📂 Processing collection: ${col.name}`);
    console.log('─'.repeat(50));

    const querySnapshot = await getDocs(collection(db, col.name));
    const docs = querySnapshot.docs;
    console.log(`   Found ${docs.length} documents`);

    for (const docSnap of docs) {
      const data = docSnap.data();
      const docRef = doc(db, col.name, docSnap.id);
      const updates = {};
      let docLabel = data.name || data.title || data.description?.substring(0, 30) || docSnap.id;

      for (const field of col.fields) {
        const url = data[field];
        totalProcessed++;

        if (!isFirebaseUrl(url)) {
          if (url && url.includes('cloudinary')) {
            console.log(`   ⏭️  [${docLabel}] ${field} — already on Cloudinary`);
          } else if (!url) {
            console.log(`   ⏭️  [${docLabel}] ${field} — empty, skipping`);
          }
          totalSkipped++;
          continue;
        }

        try {
          process.stdout.write(`   ⬇️  [${docLabel}] ${field} — downloading...`);
          const buffer = await downloadImage(url);
          process.stdout.write(` ${(buffer.length / 1024).toFixed(0)}KB`);

          process.stdout.write(' → uploading...');
          const newUrl = await uploadToCloudinary(buffer, col.name);
          updates[field] = newUrl;

          console.log(' ✅ done');
          totalMigrated++;
        } catch (err) {
          console.log(` ❌ FAILED: ${err.message}`);
          totalFailed++;
        }
      }

      // Update Firestore if any fields were migrated
      if (Object.keys(updates).length > 0) {
        try {
          await updateDoc(docRef, updates);
          console.log(`   💾 Updated Firestore document`);
        } catch (err) {
          console.log(`   ❌ Failed to update Firestore: ${err.message}`);
          totalFailed++;
        }
      }
    }
  }

  console.log('\n' + '═'.repeat(50));
  console.log('📊 Migration Summary:');
  console.log(`   Total image fields checked: ${totalProcessed}`);
  console.log(`   ✅ Successfully migrated:    ${totalMigrated}`);
  console.log(`   ⏭️  Skipped (empty/already):  ${totalSkipped}`);
  console.log(`   ❌ Failed:                   ${totalFailed}`);
  console.log('═'.repeat(50));

  if (totalFailed > 0) {
    console.log('\n⚠️  Some images failed. You can re-run this script safely — it skips already-migrated images.');
  } else {
    console.log('\n🎉 All images migrated successfully!');
  }

  process.exit(0);
}

migrate().catch((err) => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
