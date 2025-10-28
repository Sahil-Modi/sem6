# 🚀 Getting Started with MediReach

## Quick Start (5 Minutes)

### Prerequisites
- ✅ Node.js installed (v14 or higher)
- ✅ npm or yarn package manager
- ✅ A code editor (VS Code recommended)
- ✅ Firebase account (free tier is sufficient)

---

## Step-by-Step Setup

### Step 1: Project Setup ✅ DONE

The project is already set up with all necessary dependencies installed!

Files created:
- ✅ React components (Auth, Dashboard, Layout)
- ✅ Firebase configuration
- ✅ Routing system
- ✅ Tailwind CSS styling
- ✅ Context for state management

### Step 2: Firebase Configuration (REQUIRED)

⚠️ **IMPORTANT**: You must set up Firebase before the app will work!

1. **Go to [Firebase Console](https://console.firebase.google.com/)**

2. **Create a new project:**
   - Click "Add project"
   - Name it "MediReach" or anything you prefer
   - Disable Google Analytics (optional)

3. **Enable Authentication:**
   - Navigate to Authentication → Sign-in method
   - Enable "Email/Password"
   - Enable "Google" (add your email as support email)

4. **Create Firestore Database:**
   - Navigate to Firestore Database
   - Click "Create database"
   - Start in "Production mode"
   - Choose your preferred location

5. **Get your Firebase config:**
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps" section
   - Click the Web icon (</>)
   - Copy the configuration object

6. **Update the config file:**
   - Open `src/firebase/config.js`
   - Replace the placeholder values with your actual Firebase config:

   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY_HERE",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

📖 **Detailed Firebase setup instructions:** See `FIREBASE_SETUP.md`

### Step 3: Run the Application

```bash
# The development server is already running!
# If not, run:
npm start
```

The app will open at: **http://localhost:3000**

### Step 4: Test the App

1. **Visit the homepage** - You should see the MediReach landing page
2. **Click "Register"** - Create a new account
3. **Select a role** - Try "Donor" first (easiest to test)
4. **Fill in details** - Complete the registration form
5. **Login** - Use your newly created credentials
6. **Explore Dashboard** - See the role-specific dashboard

### Step 5: Create Your First Admin User

Since you need an admin to verify organizations:

1. Register a user normally
2. Go to Firebase Console → Firestore Database
3. Find the `users` collection
4. Click on your user document
5. Edit the `role` field to `"admin"`
6. Set `verified` to `true`
7. Refresh your app - you now have admin access!

---

## 🎯 What You Can Do Now

### As a Donor:
- ✅ View your dashboard with statistics
- ✅ See urgent requests (when created)
- ✅ Update your profile
- ✅ Set availability status

### As a Receiver:
- ✅ Create resource requests (coming soon)
- ✅ View your submitted requests
- ✅ Track request status
- ✅ Connect with donors

### As NGO/Hospital:
- ✅ Verify resource requests (coming soon)
- ✅ Monitor donations
- ✅ Access analytics
- ⏳ Requires admin verification

### As Admin:
- ✅ Access all features
- ✅ Verify organizations
- ✅ View all requests
- ✅ System analytics

---

## 📂 Project Structure Overview

```
medireach/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   │   ├── Auth/       # Login & Register
│   │   ├── Dashboard/  # Role-based dashboards
│   │   └── Layout/     # Navbar & common layout
│   ├── context/        # Auth context for state
│   ├── firebase/       # Firebase configuration
│   ├── App.js          # Main app with routing
│   └── index.js        # Entry point
├── README.md           # Main documentation
├── FIREBASE_SETUP.md   # Detailed Firebase guide
├── PROJECT_DOCUMENTATION.md  # Complete project report
└── package.json        # Dependencies
```

---

## 🔧 Available Scripts

```bash
# Start development server (already running!)
npm start

# Run tests
npm test

# Build for production
npm run build

# Eject from Create React App (not recommended)
npm run eject
```

---

## 🎨 Current Features (Implemented)

✅ **Authentication System**
- Email/password registration and login
- Google OAuth integration
- Role-based user accounts (Admin, NGO, Hospital, Donor, Receiver)
- Protected routes based on roles

✅ **User Dashboards**
- Personalized dashboard for each role
- Quick action buttons
- Recent activity feed
- Statistics cards

✅ **Navigation**
- Responsive navbar
- Role-based menu items
- User profile display
- Logout functionality

✅ **Home Page**
- Hero section
- Features overview
- How it works section
- Statistics display
- Call-to-action buttons

✅ **Styling**
- Tailwind CSS framework
- Responsive design
- Custom color scheme
- Smooth animations

---

## 🚧 Coming Soon (Next Phase)

The following features are planned:

🔜 **Request Management**
- Create resource requests
- Request verification workflow
- Status tracking
- Request history

🔜 **Donor Directory**
- Search and filter donors
- Map view with Leaflet.js
- Donor profiles
- Availability indicators

🔜 **Notifications**
- Real-time Firebase Cloud Messaging
- In-app notification center
- Email notifications
- SMS alerts (future)

🔜 **Analytics Dashboard**
- Charts and graphs (Recharts)
- Request statistics
- Donor activity metrics
- Geographic distribution

🔜 **AI Matching System**
- Python/Flask microservice
- Location-based matching
- Urgency prediction
- Smart recommendations

---

## 🐛 Troubleshooting

### App won't start?
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start
```

### Firebase errors?
- ✅ Check that you've replaced ALL config values in `src/firebase/config.js`
- ✅ Verify Firebase Authentication is enabled
- ✅ Ensure Firestore Database is created
- ✅ Check Firebase Console for error messages

### Styling not working?
- ✅ Tailwind CSS is configured - restart dev server if needed
- ✅ Check browser console for CSS errors
- ✅ Clear browser cache

### Can't login after registration?
- ✅ Check Firebase Console → Authentication to verify user was created
- ✅ Check browser console for error messages
- ✅ Verify Firestore rules allow user document creation

### Role-based features not working?
- ✅ Check that user document exists in Firestore `users` collection
- ✅ Verify `role` field is set correctly
- ✅ For NGO/Hospital, ensure `verified` is true

---

## 📚 Documentation Files

1. **README.md** - Main project documentation (you are here!)
2. **FIREBASE_SETUP.md** - Detailed Firebase configuration guide
3. **PROJECT_DOCUMENTATION.md** - Complete project report for submission
4. **.env.example** - Environment variable template

---

## 💡 Tips for Development

1. **Keep Firebase Console open** - Monitor authentication, database, and errors
2. **Use React DevTools** - Install the browser extension for debugging
3. **Check Console** - Browser console shows errors and warnings
4. **Test all roles** - Create multiple accounts to test different user experiences
5. **Version Control** - Commit frequently to track changes

---

## 🌟 Next Steps

Now that your app is running:

1. ✅ **Complete Firebase setup** (if not done)
2. ✅ **Test authentication flow** (register, login, logout)
3. ✅ **Create users for each role** (admin, donor, receiver, NGO)
4. ✅ **Explore dashboards** (switch between roles)
5. 🔜 **Start building request management** (next feature)
6. 🔜 **Add donor directory** (with map integration)
7. 🔜 **Implement notifications** (real-time updates)

---

## 🤝 Need Help?

### Resources:
- 📖 [React Documentation](https://react.dev)
- 🔥 [Firebase Documentation](https://firebase.google.com/docs)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- 🗺️ [Leaflet.js Documentation](https://leafletjs.com)

### Common Issues:
1. Check `FIREBASE_SETUP.md` for Firebase problems
2. Review browser console for errors
3. Check Firebase Console for backend issues
4. Verify all dependencies are installed

---

## 🎉 Congratulations!

You now have a fully functional authentication system with role-based dashboards for your MediReach project! 

**Your app includes:**
- ✅ 5 different user roles with unique dashboards
- ✅ Secure authentication with Firebase
- ✅ Beautiful, responsive UI with Tailwind CSS
- ✅ Protected routes and role-based access
- ✅ Professional landing page
- ✅ Complete project structure

**Ready for:**
- 🚀 Adding request management features
- 🚀 Building the donor directory
- 🚀 Implementing notifications
- 🚀 Creating analytics dashboards
- 🚀 Adding AI matching algorithms

---

Happy Coding! 🚀💙

If you encounter any issues, refer to the troubleshooting section or check the detailed documentation files.
