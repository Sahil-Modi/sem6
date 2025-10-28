# Troubleshooting Firebase Permission Errors

## Error: "Missing or insufficient permissions"

### Cause:
Firestore security rules are blocking access to the database.

### Solution:

#### Step 1: Update Firestore Rules (REQUIRED)

1. Go to: https://console.firebase.google.com/project/medi-reach-6/firestore/rules

2. Replace the existing rules with this (for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"** (top right corner)

4. Wait for success message

#### Step 2: Verify Authentication is Enabled

1. Go to: https://console.firebase.google.com/project/medi-reach-6/authentication/providers

2. Ensure these are **Enabled**:
   - ✅ Email/Password
   - ✅ Google (if you want Google sign-in)

3. Click on each and make sure "Enable" toggle is ON

#### Step 3: Check Authorized Domains

1. Go to: https://console.firebase.google.com/project/medi-reach-6/authentication/settings

2. Scroll to "Authorized domains"

3. Ensure `localhost` is in the list

4. If not, click "Add domain" and add: `localhost`

#### Step 4: Clear Cache and Test

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. Or open **Incognito/Private window**
3. Go to http://localhost:3000
4. Try to register a new user

---

## Error: "400 Bad Request" on Sign Up

### Cause:
Authentication provider might not be enabled or API restrictions.

### Solution:

#### Option 1: Check Authentication Providers

1. Go to: https://console.firebase.google.com/project/medi-reach-6/authentication/providers

2. Click on **"Email/Password"**

3. Make sure:
   - ✅ "Enable" toggle is ON
   - ✅ Click "Save" if you made changes

#### Option 2: Check API Key Restrictions

1. Go to: https://console.cloud.google.com/apis/credentials?project=medi-reach-6

2. Find your "Browser key" (usually named "Browser key (auto created by Firebase)")

3. Click on it

4. Under "API restrictions":
   - Select "Don't restrict key" (for development)
   - Or ensure these APIs are allowed:
     - Identity Toolkit API
     - Cloud Firestore API
     - Firebase Authentication

5. Click "Save"

#### Option 3: Regenerate API Key (if nothing else works)

1. Go to Firebase Project Settings
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Update your `firebase/config.js` with the new config

---

## Testing Checklist

After fixing the above:

- [ ] Firestore rules updated and published
- [ ] Email/Password authentication enabled
- [ ] localhost in authorized domains
- [ ] Browser cache cleared
- [ ] Try registering a new user
- [ ] Check Firebase Console → Authentication for new user
- [ ] Check Firebase Console → Firestore for user document

---

## Still Not Working?

### Check Firebase Console for Errors:

1. **Firestore → Data tab**
   - Do you see a "users" collection?
   - If yes, check if documents are being created

2. **Authentication → Users tab**
   - Do you see registered users?
   - If no, authentication is failing

3. **Firestore → Rules tab**
   - Click "Rules Playground"
   - Test if a read/write would be allowed

### Check Browser Console:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for detailed error messages
4. Share the full error trace if asking for help

---

## Quick Copy-Paste Firestore Rules

### For Development (Permissive):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### For Production (Secure):
See `firestore.rules` file in project root.

---

## Common Mistakes:

1. ❌ Forgot to click "Publish" after updating rules
2. ❌ Authentication provider not enabled
3. ❌ Wrong project selected in Firebase Console
4. ❌ Old browser cache causing issues
5. ❌ API key restrictions blocking requests

---

## Need More Help?

1. Check Firebase Console → Project Overview → "Health" tab
2. Check Firebase Console → "Usage" tab for quota issues
3. Verify billing is set up (free tier is enough for development)
4. Make sure you're not hitting Firebase quotas

---

**After fixing, your app should work perfectly!** 🎉
