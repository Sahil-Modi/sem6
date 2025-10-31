/* eslint-disable */
// Service Worker for Firebase Cloud Messaging
// IMPORTANT: Replace the firebaseConfig below with your project's config or copy the
// values from src/firebase/config.js. This file must live in the public/ root.

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Firebase config copied from src/firebase/config.js
const firebaseConfig = {
  apiKey: "AIzaSyDpxr2fBZGqtNXu3CrirG8bgxVPjbgKawk",
  authDomain: "medi-reach-6.firebaseapp.com",
  projectId: "medi-reach-6",
  storageBucket: "medi-reach-6.firebasestorage.app",
  messagingSenderId: "271991605837",
  appId: "1:271991605837:web:de01b1ed21009045082a04",
  measurementId: "G-XVSC9GCR0E"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notification = payload.notification || {};
  const title = notification.title || 'MediReach';
  const options = {
    body: notification.body || payload.data?.message || '',
    icon: '/favicon.ico',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
