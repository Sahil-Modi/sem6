// Firebase Configuration for MediReach
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your Firebase config
// Get this from Firebase Console > Project Settings > Your apps > Config
const firebaseConfig = {
  apiKey: "AIzaSyDpxr2fBZGqtNXu3CrirG8bgxVPjbgKawk",
  authDomain: "medi-reach-6.firebaseapp.com",
  projectId: "medi-reach-6",
  storageBucket: "medi-reach-6.firebasestorage.app",
  messagingSenderId: "271991605837",
  appId: "1:271991605837:web:de01b1ed21009045082a04",
  measurementId: "G-XVSC9GCR0E"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Cloud Messaging (optional - requires HTTPS in production)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.log('FCM not available:', error);
}

export { messaging };
export default app;
