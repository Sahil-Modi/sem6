import { messaging } from './config';
import { getToken, onMessage } from 'firebase/messaging';
import { db } from './config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Helper to register for push notifications and store token in Firestore
export async function registerForPush(userId) {
  if (!messaging) {
    console.warn('FCM messaging is not initialized. Ensure getMessaging(app) succeeded.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY || process.env.REACT_APP_VAPID_KEY;
    if (!vapidKey) {
      console.warn('VAPID key not set. Add REACT_APP_FIREBASE_VAPID_KEY to .env');
    }

    const token = await getToken(messaging, { vapidKey });
    if (token) {
      // Persist token in Firestore under fcmTokens collection (token ID = token string)
      await setDoc(doc(db, 'fcmTokens', token), {
        token,
        userId,
        createdAt: serverTimestamp()
      });
      console.log('FCM token saved to Firestore');
      return token;
    }
    console.log('No registration token available. Request permission to generate one.');
    return null;
  } catch (err) {
    console.error('Error registering for push', err);
    return null;
  }
}

// Helper to listen for foreground messages (returns unsubscribe)
export function onForegroundMessage(cb) {
  if (!messaging) {
    console.warn('FCM messaging is not initialized.');
    return () => {};
  }
  return onMessage(messaging, (payload) => cb(payload));
}
