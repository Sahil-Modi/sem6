# 🎬 MediReach Feature Demonstration Guide

## Complete walkthrough of all 6 core features + enhancements

---

## 🔐 **Feature 1: Authentication System**

### Email/Password Registration

1. **Navigate to:** http://localhost:3000/register

2. **Test Donor Registration:**
   - Name: `John Doe`
   - Email: `john.donor@test.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
   - Phone: `+91 9876543210`
   - Location: `Mumbai, Maharashtra`
   - Role: `Donor`
   - Blood Group: `O+`
   - Click "Create Account"
   - ✅ **Result:** Auto-verified, redirected to donor dashboard

3. **Test Receiver Registration:**
   - Email: `sarah.receiver@test.com`
   - Role: `Receiver`
   - (Other fields similar)
   - ✅ **Result:** Auto-verified, redirected to receiver dashboard

4. **Test NGO Registration:**
   - Email: `care.ngo@test.com`
   - Role: `NGO`
   - Organization Name: `Care Foundation`
   - Organization Type: `Healthcare NGO`
   - ✅ **Result:** Pending verification status shown

### Google OAuth Login

1. Click "Sign in with Google" button
2. Select Google account
3. ✅ **Result:** Logged in and redirected to dashboard

### Role-Based Dashboards

**Donor Dashboard Shows:**
- Blood group badge
- Donation stats (Urgent Requests, Contributions, Availability)
- Quick actions: View Requests, Find Donors, History, Ratings
- Recent activity feed

**Receiver Dashboard Shows:**
- Create request banner
- Request stats (My Requests, In Progress, Fulfilled)
- Quick actions: Create Request, View Requests, Find Donors, Chat

**Admin Dashboard Shows:**
- System stats (Total Requests, Active, Completed, Verification Queue)
- Quick actions: Verify Requests, All Requests, Analytics, Admin Panel

---

## 🔔 **Feature 2: Notification System**

### Real-Time Notifications

1. **Setup:**
   - Login as Admin
   - Go to Notifications page
   - Click "Allow Notifications" when prompted

2. **Test New Request Notification:**
   - Open second browser window
   - Login as Receiver
   - Create an urgent blood request
   - **Back to Admin window:**
     - ✅ Bell icon shows red dot
     - ✅ Notification appears: "New request submitted: Blood (High)..."
     - ✅ Toast notification pops up

3. **Test Verification Notification:**
   - As Admin, go to "Verify Requests"
   - Verify the pending request
   - **Switch to Receiver window:**
     - ✅ Notification appears: "Your request has been verified..."
     - ✅ Request status changes to "Verified"

4. **Test Donor Match Notification:**
   - Login as Donor
   - ✅ Notification shows: "🚨 URGENT: Blood needed in Mumbai (2.3 km away)"
   - ✅ Includes tracking ID
   - ✅ Shows distance if coordinates available

5. **Test Acceptance Notification:**
   - As Donor, accept a request
   - **Switch to Receiver window:**
     - ✅ Notification: "Great news! John Doe accepted your request"
     - ✅ Shows donor contact info

### Push Notifications (Background)

1. Close browser tab
2. Create new request from another device/account
3. ✅ Desktop notification appears even when tab closed
4. ✅ Click notification to open app

---

## 🔍 **Feature 3: Resource Directory**

### Donor Directory Features

1. **Navigate to:** Dashboard → Donors

2. **Test Filters:**
   - **Blood Group Filter:**
     - Select "O+" from dropdown
     - ✅ Only O+ donors shown
   
   - **Availability Filter:**
     - Select "Available Only"
     - ✅ Only available donors shown
   
   - **Search:**
     - Type "Mumbai" in search box
     - ✅ Donors from Mumbai shown

3. **Test Distance Calculation:**
   - Ensure your user profile has location set
   - ✅ Each donor card shows distance: "2.3 km away"
   - ✅ Donors sorted by distance (nearest first)

4. **Test Map View:**
   - Click "🗺️ Map" button
   - ✅ Switch to map visualization
   - ✅ Donor markers plotted on map
   - ✅ Click marker to see donor info

5. **Test Grid View:**
   - Click "📋 List" button
   - ✅ Switch back to card grid
   - ✅ Professional donor cards with badges

6. **Test Contact Donor:**
   - Click "Contact Donor" button on any card
   - ✅ Navigates to Chat page

### Verified Badge Display

- ✅ Donors with `verified: true` show "✓ Verified" badge
- ✅ Badge appears in top-right of card

---

## 🆘 **Feature 4: Request Management System**

### Creating Emergency Request

1. **Login as Receiver**
2. **Navigate to:** Dashboard → "Create New Request" button
3. **Fill Form:**
   - Resource Type: `Blood`
   - Urgency: `Critical`
   - Location: `Andheri, Mumbai`
   - Description: `Patient needs AB+ blood urgently for surgery. 2 units required.`

4. **Submit Request:**
   - ✅ Tracking ID generated: `REQ-1735660800-ABC123XYZ`
   - ✅ Location geocoded to coordinates
   - ✅ Request saved to Firestore
   - ✅ Status: "Pending"

### Automatic Matching Process

**Behind the scenes (check browser console):**

1. ✅ Request geocoded: `{lat: 19.12, lng: 72.85}`
2. ✅ Fetching available donors...
3. ✅ AI matching service called (if running)
4. ✅ Donors ranked by distance and availability
5. ✅ Top 10 donors notified (Critical urgency)
6. ✅ Notifications created with distance info

### Viewing Requests

1. **Navigate to:** Dashboard → Requests

2. **Role-Based Visibility:**
   - **Admin/NGO/Hospital:** See ALL requests
   - **Donor:** See only VERIFIED requests
   - **Receiver:** See only OWN requests

3. **Filter Requests:**
   - Click "Pending" → ✅ Only pending requests
   - Click "Verified" → ✅ Only verified requests
   - Click "Completed" → ✅ Only completed requests

4. **Color-Coded Badges:**
   - Critical: Red badge
   - High: Orange badge
   - Medium: Yellow badge
   - Low: Green badge

### Request Details Page

1. **Click:** "View Details" on any request
2. **View Information:**
   - ✅ Large resource type icon (🩸 for Blood)
   - ✅ Urgency and status badges
   - ✅ Progress tracker (Pending → Verified → Matched → In Progress → Completed)
   - ✅ Location, created date, receiver info
   - ✅ Description in highlighted box
   - ✅ Accepted donors count

3. **Donor Actions:**
   - As Donor, click "I Can Help - Accept Request"
   - ✅ Status changes to "Matched"
   - ✅ Donor added to acceptedDonors array
   - ✅ Receiver notified

4. **Receiver Actions:**
   - As Receiver, click "Mark In Progress"
   - ✅ Status changes to "In Progress"
   - Click "Mark Completed"
   - ✅ Status changes to "Completed"
   - ✅ All accepted donors notified

---

## ✅ **Feature 5: Verification & Tracking**

### Request Verification Workflow

1. **Login as Admin/NGO**
2. **Navigate to:** Dashboard → "Verify Requests"

3. **View Pending Requests:**
   - ✅ Shows all requests with status "Pending"
   - ✅ Displays: Type, Urgency, Location, Description
   - ✅ Shows receiver name and phone

4. **Verify Request:**
   - Click "✅ Verify" button
   - ✅ Status changes to "Verified"
   - ✅ Receiver gets notification
   - ✅ Request now visible to donors
   - ✅ Request removed from verification queue

5. **Reject Request:**
   - Click "❌ Reject" button
   - Enter rejection reason: `Incomplete information provided`
   - Click "Confirm Reject"
   - ✅ Status changes to "Rejected"
   - ✅ Receiver notified with reason

### Tracking ID System

**Every request gets unique ID:**
```
Format: REQ-{timestamp}-{randomCode}
Example: REQ-1735660800-ABC123XYZ
```

**Track Request:**
1. Copy tracking ID from confirmation
2. Search in requests list
3. View complete journey:
   - Created: Dec 31, 2025 10:00 AM
   - Verified: Dec 31, 2025 10:15 AM (by Admin Name)
   - Matched: Dec 31, 2025 10:30 AM
   - Completed: Dec 31, 2025 2:00 PM

### Lifecycle Transparency

**Visual Progress Tracker:**
```
[✓] Pending → [✓] Verified → [✓] Matched → [ ] In Progress → [ ] Completed
```

- ✅ Completed steps: Green with checkmark
- ⏳ Current step: Highlighted
- ⚪ Future steps: Gray

### User Verification (NGO/Hospital)

1. **NGO/Hospital registers**
2. **Shows:** `⏳ Pending Verification` badge on profile
3. **Limited access:** Can view but not verify requests
4. **Admin verifies:**
   - Go to Admin Panel → Users Management
   - Find NGO user
   - Click "Verify"
5. **NGO account activated:**
   - ✅ Badge changes to `✓ Verified`
   - ✅ Full access granted
   - ✅ Can now verify requests

---

## 🤖 **Feature 6: AI Donor Matcher**

### Setup AI Service

1. **Open Terminal:**
   ```bash
   cd ai-matcher
   python app.py
   ```

2. **Verify Service Running:**
   ```
   ╔══════════════════════════════════════════════════╗
   ║   MediReach AI Donor Matcher Service Started    ║
   ║   Version: 1.0.0                                 ║
   ║   Port: 5000                                     ║
   ╚══════════════════════════════════════════════════╝
   ```

3. **Test Health Endpoint:**
   - Open: http://localhost:5000/health
   - ✅ Response: `{"status": "healthy"}`

### AI Matching in Action

1. **Create Request as Receiver:**
   - Type: Blood
   - Urgency: Critical
   - Location: Mumbai
   - Description: "Emergency surgery needs O+ blood immediately"

2. **Check Browser Console:**
   ```
   Using AI-powered matching...
   Sending 50 donors to AI service...
   AI service response: 10 top matches
   Top donor: John Doe (Match Score: 95.5%, Distance: 2.3 km)
   ```

3. **Matching Algorithm:**
   - ✅ Distance Score (50%): Haversine formula
   - ✅ Availability Score (25%): Current status
   - ✅ Reliability Score (15%): Past completion rate
   - ✅ Urgency Bonus (10%): Critical request priority

4. **Result:**
   - Top 10 donors notified
   - Sorted by match score (highest first)
   - Includes distance in notification: "2.3 km away"

### Urgency Prediction

**Test API Endpoint:**
```javascript
POST http://localhost:5000/api/predict-urgency
{
  "description": "Patient critically ill needs blood immediately life threatening"
}

Response:
{
  "predictedUrgency": "Critical",
  "confidence": 0.9,
  "urgencyScore": 12
}
```

**Keywords Detected:**
- Critical: `critical`, `emergency`, `immediately`, `dying`, `severe`
- High: `soon`, `quickly`, `asap`, `important`, `needed`

### Distance Calculation

**Test API Endpoint:**
```javascript
POST http://localhost:5000/api/calculate-distance
{
  "point1": {"lat": 19.076, "lng": 72.877},
  "point2": {"lat": 19.080, "lng": 72.880}
}

Response:
{
  "success": true,
  "distance": 0.52,
  "unit": "kilometers"
}
```

### Fallback Mechanism

**If AI Service Unavailable:**
1. Request created without AI
2. ✅ JavaScript-based distance matching used
3. ✅ Donors still ranked by proximity
4. Console shows: `Using fallback matching...`

---

## 🎁 **Bonus Features Demonstrated**

### Donation History (Donor)

1. Login as Donor
2. Navigate to "Donation History"
3. ✅ View stats: Total, Completed, Pending, Cancelled
4. ✅ Impact summary: Lives saved, ML donated
5. ✅ Timeline of past donations
6. ✅ Filter by status

### Analytics Dashboard (Admin)

1. Login as Admin
2. Navigate to "Analytics"
3. ✅ View charts:
   - Request trends (7-day line chart)
   - Requests by type (bar chart)
   - Status distribution (pie chart)
   - User distribution by role
4. ✅ Top donors leaderboard

### Chat System

1. Navigate to "Chat"
2. ✅ View conversation list
3. ✅ Click user to start chat
4. ✅ Send messages in real-time
5. ✅ See timestamps and sender names

### Ratings System

1. Navigate to "Ratings"
2. ✅ Rate users (1-5 stars)
3. ✅ Write text review
4. ✅ View average ratings
5. ✅ Star visualization

### Admin Panel

1. Login as Admin
2. Navigate to "Admin Panel"
3. **Users Management:**
   - ✅ View all users
   - ✅ Search by name/email
   - ✅ Filter by role
   - ✅ Verify users
   - ✅ Delete users
4. **Request Management:**
   - ✅ View all requests
   - ✅ Update status
   - ✅ Delete requests
5. **System Settings:**
   - ✅ Notification toggles
   - ✅ System information
   - ✅ Export data

---

## 🎯 Complete User Journey

### Scenario: Emergency Blood Request

**Act 1: The Emergency (Receiver)**
1. Sarah's friend needs urgent AB+ blood
2. Sarah registers as Receiver
3. Creates request: "Friend needs AB+ blood for surgery tomorrow"
4. Request gets tracking ID: REQ-123456

**Act 2: The Verification (Admin)**
1. Admin receives notification
2. Reviews request details
3. Verifies authenticity
4. Approves request → Status: Verified

**Act 3: The Matching (AI System)**
1. AI service analyzes 50 nearby donors
2. Finds 10 best matches based on:
   - Distance (John is 2.3 km away)
   - Availability (John is available)
   - Reliability (John has 90% completion rate)
   - Blood group compatibility
3. Ranks John as #1 match (95.5% score)

**Act 4: The Response (Donor)**
1. John receives notification: "URGENT: AB+ blood needed 2.3 km away"
2. Opens request details
3. Sees Sarah's story and contact info
4. Clicks "I Can Help - Accept Request"
5. Status → Matched

**Act 5: The Donation**
1. Sarah contacts John via chat
2. They coordinate meeting
3. Sarah marks request "In Progress"
4. Donation happens at hospital
5. Sarah marks request "Completed"

**Act 6: The Impact**
1. John's donation history updated
2. John's reliability score increases
3. Both receive completion notifications
4. Sarah can rate John's helpfulness
5. Analytics dashboard updates with success

---

## ✅ Success Checklist

After following this guide, you should have tested:

- [✅] Email/Password registration (all 5 roles)
- [✅] Google OAuth login
- [✅] Role-specific dashboards
- [✅] Real-time notifications
- [✅] Push notifications
- [✅] Donor directory with filters
- [✅] Map visualization
- [✅] Distance-based sorting
- [✅] Create emergency request
- [✅] Request verification workflow
- [✅] Request details page
- [✅] Accept request as donor
- [✅] Status transitions
- [✅] Tracking ID system
- [✅] AI matching service
- [✅] Urgency prediction
- [✅] Distance calculation
- [✅] Donation history
- [✅] Analytics charts
- [✅] Chat system
- [✅] Ratings
- [✅] Admin panel

---

**🎉 Congratulations! You've explored all features of MediReach!**

The platform is ready to save lives in real emergencies. 🩸❤️
