#!/usr/bin/env node
/**
 * Seed the Super Admin into the Firestore `admins` collection.
 * Uses the same credentials from your .env file (USER_NAME, PASSWORD).
 *
 * Usage: node scripts/seed-super-admin.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, where, serverTimestamp } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');
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

async function seed() {
  const username = process.env.USER_NAME;
  const password = process.env.PASSWORD;

  if (!username || !password) {
    console.error('❌ USER_NAME and PASSWORD must be set in .env');
    process.exit(1);
  }

  console.log('🔍 Checking if Super Admin already exists...');

  // Check if admin with this username already exists
  const adminsRef = collection(db, 'admins');
  const existing = await getDocs(query(adminsRef, where('username', '==', username)));

  if (!existing.empty) {
    console.log(`✅ Super Admin "${username}" already exists. Skipping.`);
    process.exit(0);
  }

  console.log(`📌 Creating Super Admin "${username}"...`);

  const superAdmin = {
    id: uuidv4(),
    name: 'Mandakathingal',
    username: username,
    password: password,
    role: 'superAdmin',
    permissions: {
      add: true,
      edit: true,
      view: true,
      delete: true,
    },
    isActive: true,
    sessionVersion: 0,
    createdAt: serverTimestamp(),
    createdBy: 'System',
  };

  await addDoc(adminsRef, superAdmin);
  console.log('✅ Super Admin seeded successfully!');
  console.log(`   Username: ${username}`);
  console.log(`   Role: Super Admin`);
  console.log(`   Permissions: Full Access`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
