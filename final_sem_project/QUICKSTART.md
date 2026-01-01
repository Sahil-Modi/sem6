# 🚀 Quick Start Guide - MediReach Platform

## ⚡ Start in 3 Minutes!

### Step 1: Install Python Dependencies (for AI service)

```bash
cd ai-matcher
pip install flask flask-cors numpy geopy
cd ..
```

### Step 2: Start Both Services

**Option A: Using Two Terminals**

Terminal 1 - React Frontend:
```bash
npm start
```

Terminal 2 - AI Backend:
```bash
cd ai-matcher
python app.py
```

**Option B: Using One Command (Windows)**

```bash
start cmd /k "npm start" && cd ai-matcher && python app.py
```

### Step 3: Access the Application

- **Frontend:** http://localhost:3000
- **AI Service:** http://localhost:5000

---

## 📋 Quick Testing Steps

### 1. Register Test Users

**Donor Account:**
- Email: donor@test.com
- Password: test123
- Role: Donor
- Blood Group: O+
- Location: Mumbai

**Receiver Account:**
- Email: receiver@test.com
- Password: test123
- Role: Receiver
- Location: Mumbai

**Admin Account:**
- Email: admin@test.com
- Password: test123
- Role: Admin

### 2. Create Emergency Request

1. Login as **Receiver**
2. Click "Create Request" button
3. Fill form:
   - Type: Blood
   - Urgency: High
   - Location: Mumbai
   - Description: "Need O+ blood urgently for surgery"
4. Submit

### 3. Verify Request (Admin)

1. Logout and login as **Admin**
2. Go to "Verify Requests"
3. Click "Verify" on the pending request
4. Receiver gets notification

### 4. Accept Request (Donor)

1. Logout and login as **Donor**
2. Check **Notifications** - should see urgent request
3. Go to "Requests" page
4. Click "View Details" on the verified request
5. Click "I Can Help - Accept Request"
6. Status changes to "Matched"

### 5. Complete Request

1. Login as **Receiver**
2. Go to "Requests" → View your request
3. Click "Mark In Progress"
4. Then click "Mark Completed"
5. Donor gets completion notification

---

## 🧪 Testing All Features

### AI Matching Test

1. Make sure AI service is running (`python ai-matcher/app.py`)
2. Create a request as Receiver
3. Check browser console - should see "Using AI-powered matching..."
4. Donors ranked by distance will be notified

### Donor Directory Test

1. Login as any user
2. Go to "Donors" page
3. Filter by Blood Group: O+
4. Toggle "Map" view
5. See donors plotted on map

### Analytics Test

1. Login as Admin
2. Go to "Analytics"
3. View charts showing:
   - Request trends
   - Requests by type
   - User distribution
   - Top donors

### Chat Test

1. Login as Donor
2. Go to "Chat"
3. Start conversation with a receiver
4. Send messages in real-time

---

## 🔧 Troubleshooting

### Issue: AI service not connecting

**Solution:**
```bash
# Check if service is running
curl http://localhost:5000/health

# If not running, start it:
cd ai-matcher
python app.py
```

### Issue: Firebase errors

**Solution:**
- Check `.env` file has correct Firebase credentials
- Make sure Firebase Authentication is enabled
- Make sure Firestore is created

### Issue: Notifications not working

**Solution:**
1. Get VAPID key from Firebase Console
2. Add to `.env`:
   ```
   REACT_APP_FIREBASE_VAPID_KEY=your_key
   ```
3. Restart React app

### Issue: Geocoding not working

**Solution:**
- Uses OpenStreetMap Nominatim (free)
- Rate limit: 1 request/second
- Add email to `.env`:
  ```
  REACT_APP_NOMINATIM_EMAIL=your@email.com
  ```

---

## 📱 Feature Access by Role

### Admin
- ✅ All requests
- ✅ Verify requests
- ✅ Analytics
- ✅ Admin panel
- ✅ User management

### NGO/Hospital
- ✅ All requests
- ✅ Verify requests
- ✅ Analytics
- ⏳ Requires admin verification first

### Donor
- ✅ Verified requests only
- ✅ Accept requests
- ✅ Donation history
- ✅ Donor directory
- ✅ Notifications

### Receiver
- ✅ Own requests only
- ✅ Create requests
- ✅ Mark status
- ✅ Donor directory
- ✅ Notifications

---

## 🎯 Quick Commands

### Development
```bash
npm start                    # Start React app
cd ai-matcher && python app.py  # Start AI service
npm test                     # Run tests
npm run build                # Production build
```

### Database
```bash
# Firebase Console → Firestore → Delete all data
# Then re-register users

# Or keep data and just test
```

### Logs
```bash
# React Console: F12 in browser
# AI Service: Terminal output
# Firebase: Firebase Console → Firestore → Logs
```

---

## 🌟 Demo Accounts (Pre-created)

If you want to use pre-populated data:

1. **Admin:** admin@medireach.com / Admin@123
2. **NGO:** ngo@medireach.com / Ngo@123
3. **Donor:** donor@medireach.com / Donor@123
4. **Receiver:** receiver@medireach.com / Receiver@123

*(You'll need to create these first using the register page)*

---

## 📊 Success Indicators

✅ React app running on :3000  
✅ AI service running on :5000  
✅ Can register and login  
✅ Can create requests  
✅ Notifications appear  
✅ AI matching shows in console  
✅ Donors sorted by distance  

---

## 🆘 Need Help?

Check these files:
- [COMPLETION_REPORT.md](COMPLETION_REPORT.md) - Full feature list
- [ai-matcher/README.md](ai-matcher/README.md) - AI service docs
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase setup
- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) - Complete documentation

---

**You're all set! Start saving lives! 🩸❤️**
