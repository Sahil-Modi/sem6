# MediReach - Firebase Setup Guide

## Quick Start Guide

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `medireach` (or your preferred name)
4. Disable Google Analytics (optional for development)
5. Click **"Create project"**

### 2. Set Up Authentication

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable the following providers:
   - **Email/Password**: Click, toggle "Enable", Save
   - **Google**: Click, toggle "Enable", add support email, Save

### 3. Set Up Firestore Database

1. In Firebase Console, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location (select closest to your target users)
5. Click **"Enable"**

#### Set Up Security Rules

Go to the **"Rules"** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to get user role
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if isSignedIn();
      
      // Users can write their own profile, admins can write any
      allow write: if isSignedIn() && (
        request.auth.uid == userId || 
        getUserRole() == 'admin'
      );
    }
    
    // Requests collection
    match /requests/{requestId} {
      // Anyone authenticated can read requests
      allow read: if isSignedIn();
      
      // Receivers and organizations can create requests
      allow create: if isSignedIn() && (
        getUserRole() in ['receiver', 'ngo', 'hospital', 'admin']
      );
      
      // Organizations and admins can update requests
      allow update: if isSignedIn() && (
        getUserRole() in ['admin', 'ngo', 'hospital']
      );
      
      // Only admins can delete
      allow delete: if isSignedIn() && getUserRole() == 'admin';
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      // Users can only read their own notifications
      allow read: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
      
      // System can create notifications
      allow create: if isSignedIn();
      
      // Users can update their own notifications (mark as read)
      allow update: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **"Publish"**

### 4. Set Up Storage (Optional)

1. In Firebase Console, click **"Storage"**
2. Click **"Get started"**
3. Accept the default security rules
4. Choose same location as Firestore
5. Click **"Done"**

### 5. Get Configuration Keys

1. In Firebase Console, click the **gear icon** ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click **"Add app"** → Select **Web** (</> icon)
5. Register app with nickname: `MediReach Web`
6. **Copy the configuration object** that looks like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "medireach-xxxxx.firebaseapp.com",
  projectId: "medireach-xxxxx",
  storageBucket: "medireach-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

### 6. Configure Your App

1. Open `src/firebase/config.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_ACTUAL_AUTH_DOMAIN",
  projectId: "YOUR_ACTUAL_PROJECT_ID",
  storageBucket: "YOUR_ACTUAL_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ACTUAL_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID",
  measurementId: "YOUR_ACTUAL_MEASUREMENT_ID"
};
```

### 7. Create Initial Admin User

Since the first user needs to be admin, you have two options:

#### Option A: Manual Setup (Recommended for Development)

1. Start your app: `npm start`
2. Register a new user (this will be your admin)
3. Go to Firebase Console → Firestore Database
4. Find the `users` collection
5. Click on the document for your user
6. Change the `role` field from whatever it is to `"admin"`
7. Set `verified` to `true`
8. Refresh your app

#### Option B: Using Firebase Console

1. Go to Firebase Console → Authentication
2. Click **"Add user"**
3. Enter email and password
4. Copy the UID
5. Go to Firestore Database → users collection
6. Click **"Add document"**
7. Document ID: paste the UID
8. Add fields:
   ```
   uid: [paste UID]
   email: "admin@medireach.com"
   name: "Admin User"
   role: "admin"
   verified: true
   createdAt: [current timestamp]
   location: "HQ"
   phone: "+1234567890"
   ```

### 8. Test the Setup

1. Start your development server:
   ```bash
   npm start
   ```

2. Try to:
   - Register a new user
   - Login with the user
   - Navigate to dashboard
   - Check if role-based access works

### 9. Optional: Enable Cloud Messaging (for Notifications)

1. In Firebase Console, go to **"Cloud Messaging"**
2. Click on **"Web configuration"**
3. Generate a key pair
4. Add the configuration to your app

### Common Issues & Solutions

**Issue: "Firebase: Error (auth/unauthorized-domain)"**
- Solution: Go to Authentication → Settings → Authorized domains
- Add `localhost` if testing locally

**Issue: "Missing or insufficient permissions"**
- Solution: Check Firestore Rules are published correctly
- Make sure user is authenticated

**Issue: "Firebase config not found"**
- Solution: Verify you've replaced ALL placeholder values in config.js
- Check for typos in configuration keys

**Issue: "User not showing in Firestore"**
- Solution: Check browser console for errors
- Verify Firestore is enabled and rules allow writes

### Security Best Practices

1. **Never commit** `config.js` with real keys to public repositories
2. Use **environment variables** for production
3. Enable **App Check** for production (prevents abuse)
4. Regularly review **Security Rules**
5. Enable **2FA** on your Firebase account
6. Use **separate projects** for development and production

### Next Steps

Once Firebase is configured:
1. ✅ Test authentication flow
2. ✅ Create sample users for each role
3. ✅ Test role-based access
4. ✅ Create sample requests
5. ✅ Test the full workflow

### Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React Firebase Tutorial](https://firebase.google.com/docs/web/setup)

### Support

If you encounter issues:
1. Check the [Firebase Status Dashboard](https://status.firebase.google.com/)
2. Review Firebase Console error logs
3. Check browser console for errors
4. Review this setup guide again

---

**Happy Coding! 🚀**
