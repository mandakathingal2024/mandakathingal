#!/usr/bin/env node
/**
 * Seed script: adds hardcoded Editorial, Advisory Board & Committee members
 * to the executives collection, then populates the websiteContent collection.
 *
 * Usage: node scripts/seed-website-content.js [--dry-run]
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, doc, setDoc, query, where } = require('firebase/firestore');
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
const isDryRun = process.argv.includes('--dry-run');

// All unique people across Editorial, Advisory Board, and Committee
const ALL_PEOPLE = [
  { name: 'Hamza Mandakathingal', img: '/img-1.png', role: 'Patron, Convenor & Editor' },
  { name: 'Abdul Mujeeb', img: '/img-2.png', role: 'Secretary & Sub Editor' },
  { name: 'Saleem Master', img: '/img-5.jpeg', role: 'Secretary & Sub Editor' },
  { name: 'Mohamed Shahin M', img: '/img-7.png', role: 'Designer & Creator' },
  { name: 'Kamukutty', img: '/kamukutty.png', role: 'Advisory Board Member' },
  { name: 'Yahya Master', img: '/yahya.png', role: 'Advisory Board Member' },
  { name: 'Abdul Rasheed', img: '/AbdulRasheed.png', role: 'Advisory Board Member' },
  { name: 'Mayinkutty Hajii', img: '/mayinkuttyhajii.png', role: 'Advisory Board Member' },
  { name: 'Saidu Muhammed', img: '/saidumuhammed.png', role: 'Chairman' },
  { name: 'Bava Areekad', img: '/bavaareekad.png', role: 'Vice Chairman' },
  { name: 'Thajudheen', img: '/thajudheen.png', role: 'Vice Chairman' },
  { name: 'M A Rafeeque', img: '/img-6.png', role: 'General Secretary' },
  { name: 'Shareef', img: '/shareef.png', role: 'Treasurer' },
];

// Website content sections
const EDITORIAL = {
  labelEn: 'Editorial Board',
  labelMl: 'എഡിറ്റോറിയൽ ബോർഡ്',
  titleEn: 'Editorial',
  titleMl: 'എഡിറ്റോറിയൽ',
  members: [
    { name: 'Hamza Mandakathingal', nameMl: 'ഹംസ  മണ്ടകത്തിങ്ങൽ', roleEn: 'Patron, Convenor & Editor', roleMl: 'രക്ഷാധികാരി കൺവീനർ & എഡിറ്റർ', img: '/img-1.png' },
    { name: 'Abdul Mujeeb', nameMl: 'അബ്ദുൽ മുജീബ്', roleEn: 'Secretary & Sub Editor', roleMl: 'സെക്രട്ടറി & സബ് എഡിറ്റർ', img: '/img-2.png' },
    { name: 'Saleem Master', nameMl: 'സലീം  മാസ്റ്റർ', roleEn: 'Secretary & Sub Editor', roleMl: 'സെക്രട്ടറി & സബ് എഡിറ്റർ', img: '/img-5.jpeg' },
    { name: 'Mohamed Shahin M', nameMl: 'മുഹമ്മദ് ഷാഹിൻ  എം', roleEn: 'Designer & Creator', roleMl: 'ഡിസൈനർ & ക്രിയേറ്റർ', img: '/img-7.png' },
  ],
};

const ADVISORY_BOARD = {
  labelEn: 'Advisory Council',
  labelMl: 'ഉപദേശക സഭ',
  titleEn: 'Advisory Board',
  titleMl: 'ഉപദേശക സമിതി',
  members: [
    { name: 'Hamza Mandakathingal', nameMl: 'ഹംസ  മണ്ടകത്തിങ്ങൽ', roleEn: '', roleMl: '', img: '/img-1.png' },
    { name: 'Kamukutty', nameMl: 'കാമുക്കുട്ടി', roleEn: '', roleMl: '', img: '/kamukutty.png' },
    { name: 'Yahya Master', nameMl: 'യഹ്യ മാസ്റ്റർ', roleEn: '', roleMl: '', img: '/yahya.png' },
    { name: 'Abdul Rasheed', nameMl: 'അബ്ദുൾ റഷീദ്', roleEn: '', roleMl: '', img: '/AbdulRasheed.png' },
    { name: 'Mayinkutty Hajii', nameMl: 'മാഹിൻകുട്ടി ഹാജി', roleEn: '', roleMl: '', img: '/mayinkuttyhajii.png' },
  ],
};

const COMMITTEE = {
  labelEn: 'Leadership',
  labelMl: 'നേതൃത്വം',
  titleEn: 'Committee',
  titleMl: 'കമ്മിറ്റി',
  members: [
    { name: 'Saidu Muhammed', nameMl: 'സെയ്ദു മുഹമ്മദ്', roleEn: 'Chairman', roleMl: 'ചെയർമാൻ', img: '/saidumuhammed.png' },
    { name: 'Bava Areekad', nameMl: 'ബാവ അരീക്കാട്', roleEn: 'Vice Chairman', roleMl: 'വൈസ് ചെയർമാൻ', img: '/bavaareekad.png' },
    { name: 'Thajudheen', nameMl: 'താജുദ്ദീൻ', roleEn: 'Vice Chairman', roleMl: 'വൈസ് ചെയർമാൻ', img: '/thajudheen.png' },
    { name: 'M A Rafeeque', nameMl: 'എം എ റഫീഖ്', roleEn: 'General Secretary', roleMl: 'ജനറൽ സെക്രട്ടറി', img: '/img-6.png' },
    { name: 'Abdul Mujeeb', nameMl: 'അബ്ദുൾ മുജീബ്', roleEn: 'Secretary', roleMl: 'സെക്രട്ടറി', img: '/img-2.png' },
    { name: 'Saleem Master', nameMl: 'സലീം മാസ്റ്റർ', roleEn: 'Secretary', roleMl: 'സെക്രട്ടറി', img: '/saleemmaster.jpg' },
    { name: 'Shareef', nameMl: 'ഷെരീഫ്', roleEn: 'Treasurer', roleMl: 'ട്രഷറർ', img: '/shareef.png' },
  ],
};

async function seed() {
  console.log(isDryRun ? '🔍 DRY RUN — scanning only\n' : '🚀 Seeding data...\n');

  // Step 1: Check existing executives
  const execSnap = await getDocs(collection(db, 'executives'));
  const existingNames = new Set();
  execSnap.docs.forEach((d) => {
    const data = d.data();
    if (data.name) existingNames.add(data.name.toLowerCase().trim());
  });

  console.log(`📋 Found ${execSnap.size} existing executives\n`);

  // Step 2: Add missing people to executives collection
  let added = 0;
  let skipped = 0;
  for (const person of ALL_PEOPLE) {
    if (existingNames.has(person.name.toLowerCase().trim())) {
      console.log(`  ⏭️  ${person.name} — already exists`);
      skipped++;
    } else {
      if (!isDryRun) {
        const uniqueId = uuidv4();
        await addDoc(collection(db, 'executives'), {
          id: uniqueId,
          name: person.name,
          role: person.role,
          executiveImgUrl: person.img,
        });
        console.log(`  ✅ ${person.name} — added to executives`);
      } else {
        console.log(`  ⏳ ${person.name} — would be added`);
      }
      added++;
    }
  }

  console.log(`\n📊 Executives: ${added} added, ${skipped} already existed\n`);

  // Step 3: Populate websiteContent collection
  console.log('📝 Setting up websiteContent...\n');

  const sections = [
    { id: 'editorial', data: EDITORIAL },
    { id: 'advisoryBoard', data: ADVISORY_BOARD },
    { id: 'committee', data: COMMITTEE },
  ];

  for (const section of sections) {
    if (!isDryRun) {
      await setDoc(doc(db, 'websiteContent', section.id), section.data);
      console.log(`  ✅ ${section.id} — saved (${section.data.members.length} members)`);
    } else {
      console.log(`  ⏳ ${section.id} — would save (${section.data.members.length} members)`);
    }
  }

  console.log('\n✨ Done!');
  if (isDryRun) console.log('\nRun without --dry-run to apply changes.');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
