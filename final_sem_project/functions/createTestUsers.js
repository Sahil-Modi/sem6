/**
 * Script to create test users in Firebase Auth and corresponding Firestore `users/` docs.
 *
 * Usage (PowerShell):
 * 1) Ensure you have a Firebase service account JSON and set GOOGLE_APPLICATION_CREDENTIALS:
 *    $env:GOOGLE_APPLICATION_CREDENTIALS = 'C:\path\to\serviceAccountKey.json'
 * 2) Install deps in the functions folder:
 *    cd functions; npm init -y; npm install firebase-admin
 * 3) Run:
 *    node createTestUsers.js
 *
 * Notes:
 * - This script uses the Admin SDK, so it must be run with proper service account credentials.
 * - If a user already exists, it will update/create their Firestore doc instead of failing.
 */

const admin = require('firebase-admin');

const firebaseConfig = {
  projectId: "medi-reach-6",
};

try {
  admin.initializeApp(firebaseConfig);
} catch (e) {
  // ignore if already initialized
}

const auth = admin.auth();
const db = admin.firestore();

const PASSWORD = 'Medireach@123';

const testUsers = [
  { email: 'admin@medireach.com', role: 'admin', name: 'MediReach Admin' },
  { email: 'donor@medireach.com', role: 'donor', name: 'Test Donor' },
  { email: 'reciever@medireach.com', role: 'receiver', name: 'Test Receiver' },
  { email: 'ngoorg@medireach.com', role: 'ngo', name: 'Test NGO' },
  { email: 'hospital@medireach.com', role: 'hospital', name: 'Test Hospital' }
];

async function createOrUpdateUser(u) {
  try {
    // Check if user exists by email
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(u.email);
      console.log(`User ${u.email} exists (uid=${userRecord.uid}), updating Firestore profile.`);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found') {
        // create
        userRecord = await auth.createUser({
          email: u.email,
          password: PASSWORD,
          displayName: u.name,
          emailVerified: true
        });
        console.log(`Created user ${u.email} (uid=${userRecord.uid})`);
      } else {
        throw err;
      }
    }

    const uid = userRecord.uid;

    // Compose user doc
    const userDoc = {
      uid,
      email: u.email,
      name: u.name,
      role: u.role,
      phone: '',
      location: '',
      verified: u.role === 'donor' ? true : false,
      availability: u.role === 'donor',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(uid).set(userDoc, { merge: true });
    console.log(`Firestore user document for ${u.email} set/updated.`);
  } catch (err) {
    console.error(`Error creating/updating ${u.email}:`, err.message || err);
  }
}

async function run() {
  console.log('Starting test user creation...');
  for (const u of testUsers) {
    // Small delay to avoid throttling
    await createOrUpdateUser(u);
  }
  console.log('Done. Test users created/updated.');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
