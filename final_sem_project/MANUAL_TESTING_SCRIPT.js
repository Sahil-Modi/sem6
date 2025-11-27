/**
 * MediReach Manual Testing Script
 * 
 * Use this guide to manually test all functionalities
 * Open browser DevTools Console and follow the steps
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║       MediReach Comprehensive Testing Guide                  ║
║       Version 1.0 - November 7, 2025                         ║
╚══════════════════════════════════════════════════════════════╝

🎯 TESTING CHECKLIST - Execute in Order

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  AUTHENTICATION FLOW TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 1.1: Register as Admin
   • Navigate to: http://localhost:3000/register
   • Fill in:
     - Name: Admin User
     - Email: admin@medireach.com
     - Password: admin123
     - Confirm Password: admin123
     - Phone: +1234567890
     - Location: New York, USA
     - Role: Admin (if available, else use donor)
   • Click "Register"
   • ✅ Expected: Redirect to /dashboard
   • ✅ Verify: Admin dashboard with 4 stat cards visible

📝 Test 1.2: Register as Donor
   • Logout (top right button)
   • Navigate to: /register
   • Fill in:
     - Name: John Donor
     - Email: donor@test.com
     - Password: donor123
     - Blood Group: O+
     - Role: Donor
   • Click "Register"
   • ✅ Expected: Redirect to /dashboard
   • ✅ Verify: Donor dashboard with blood group display

📝 Test 1.3: Register as Receiver
   • Logout and go to /register
   • Fill in:
     - Name: Jane Receiver
     - Email: receiver@test.com
     - Password: receiver123
     - Role: Receiver
   • Click "Register"
   • ✅ Expected: Redirect to /dashboard
   • ✅ Verify: Receiver dashboard with "Create New Request" button

📝 Test 1.4: Register as NGO
   • Logout and go to /register
   • Fill in:
     - Name: Red Cross Rep
     - Email: ngo@test.com
     - Password: ngo12345
     - Role: NGO
     - Organization Name: Red Cross International
     - Organization Type: Health
   • Click "Register"
   • ✅ Expected: Redirect to /dashboard
   • ✅ Verify: Yellow warning banner "Pending Verification"

📝 Test 1.5: Login Test
   • Logout
   • Go to /login
   • Enter: donor@test.com / donor123
   • Click "Login"
   • ✅ Expected: Redirect to /dashboard (Donor dashboard)

📝 Test 1.6: Google Login Test
   • Logout
   • Go to /login
   • Click "Login with Google"
   • ✅ Expected: Google OAuth popup, then redirect to /dashboard

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣  NAVIGATION TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 2.1: Navbar Links (As Donor)
   • Login as donor@test.com
   • Click each link in navbar:
     ✅ Dashboard → /dashboard (shows donor dashboard)
     ✅ Requests → /requests (shows verified requests)
     ✅ Donors → /donors (shows donor directory)
     ✅ Chat → /chat (shows chat interface)
     ✅ History → /donation-history (donor only)
     ✅ Ratings → /ratings (shows ratings page)
     ✅ 🔔 → /notifications (shows notifications)
     ✅ Logout → redirects to /login

📝 Test 2.2: Navbar Links (As Admin/NGO)
   • Login as admin or NGO account
   • Verify additional links appear:
     ✅ Verify Requests → /verify-requests
     ✅ Analytics → /analytics
     ✅ Admin → /admin (admin only)

📝 Test 2.3: Dashboard Quick Actions (Donor)
   • Go to /dashboard as donor
   • Click each Quick Action button:
     ✅ View Urgent Requests → /requests
     ✅ Find Nearby Donors → /donors
     ✅ My History → /donation-history
     ✅ Give Ratings → /ratings

📝 Test 2.4: Dashboard Quick Actions (Receiver)
   • Login as receiver@test.com
   • Go to /dashboard
   • Click each Quick Action:
     ✅ Create Request → /create-request
     ✅ View All Requests → /requests
     ✅ Find Donors → /donors
     ✅ Chat with Donors → /chat

📝 Test 2.5: Dashboard Quick Actions (Admin/NGO)
   • Login as admin or NGO
   • Go to /dashboard
   • Click each Quick Action:
     ✅ Verify Requests → /verify-requests
     ✅ View All Requests → /requests
     ✅ Donor Directory/Analytics → /donors or /analytics
     ✅ Admin Panel → /admin (admin only)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣  CORE FUNCTIONALITY TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 3.1: Create Request (Receiver)
   • Login as receiver@test.com
   • Go to /create-request
   • Fill form:
     - Type: Blood
     - Urgency: High
     - Location: New York, USA
     - Description: Urgent need for O+ blood
   • Click "Submit Request"
   • ✅ Expected: Redirect to /requests
   • ✅ Verify: New request appears in list
   • ✅ Check DevTools Console: No errors
   • ✅ Check Firestore: New document in 'requests' collection

📝 Test 3.2: View Requests (All Roles)
   • Login as different roles and go to /requests
   • As Donor:
     ✅ Should see only "Verified" requests
   • As Receiver:
     ✅ Should see only own requests
   • As Admin/NGO/Hospital:
     ✅ Should see all requests
   • Test filters:
     ✅ Click "Pending" → shows only pending
     ✅ Click "Verified" → shows only verified
     ✅ Click "Completed" → shows only completed
   • Test search:
     ✅ Type "Blood" → filters by type
     ✅ Type "New York" → filters by location

📝 Test 3.3: Verify Request (Admin/NGO)
   • Login as admin or NGO
   • Go to /verify-requests
   • ✅ Should see pending requests
   • Click "Verify" on a request
   • ✅ Expected: Request disappears from list
   • ✅ Check /requests: Status changed to "Verified"
   • ✅ Check notifications: Receiver got notification

📝 Test 3.4: Donor Directory
   • Login as any user
   • Go to /donors
   • ✅ Should see list of donors
   • Test filters:
     - Select blood group → filters list
     - Toggle "Available Only" → shows only available
   • Test search:
     - Type donor name → filters results
   • ✅ Verify distance display (if geolocation works)
   • ✅ Click on donor card → shows details/contact

📝 Test 3.5: Chat System
   • Login as donor@test.com
   • Go to /chat
   • ✅ Should see conversation list (or empty state)
   • Open a conversation (if exists)
   • Type a message and click Send
   • ✅ Message appears in thread
   • ✅ Message persists on page refresh
   • Open another browser/incognito:
     - Login as different user
     - Go to /chat
     - ✅ Should see real-time message update

📝 Test 3.6: Donation History (Donor)
   • Login as donor@test.com
   • Go to /donation-history
   • ✅ Should see statistics cards
   • ✅ Should see donation list (or empty state)
   • Test filters:
     - Click "Completed" → shows completed only
     - Click "Pending" → shows pending only
   • ✅ Verify impact metrics display

📝 Test 3.7: Ratings System
   • Login as any user
   • Go to /ratings
   • ✅ Should see list of users to rate
   • Click "Rate" button on a user
   • ✅ Rating modal opens
   • Select 5 stars
   • Type review text
   • Click "Submit Rating"
   • ✅ Modal closes
   • ✅ Average rating updates
   • ✅ Check Firestore: New rating document created

📝 Test 3.8: Analytics Dashboard (Admin/NGO)
   • Login as admin or NGO
   • Go to /analytics
   • ✅ Should see 4 stat cards
   • ✅ Line chart displays (7-day trend)
   • ✅ Bar chart displays (requests by type)
   • ✅ 3 Pie charts display:
     - Status distribution
     - Role distribution
     - Urgency distribution
   • ✅ Top Donors table displays
   • ✅ All data loads without errors

📝 Test 3.9: Admin Panel (Admin Only)
   • Login as admin
   • Go to /admin
   • User Management Tab:
     ✅ User table displays
     ✅ Search works
     ✅ Click "Verify" → updates user status
     ✅ Click "Delete" → shows confirmation
   • Request Management Tab:
     ✅ Request table displays
     ✅ Status dropdown works
   • System Settings Tab:
     ✅ Settings display
     ✅ Configuration options visible

📝 Test 3.10: Notifications
   • Go to /notifications
   • ✅ Should see notification list
   • ✅ Unread notifications highlighted
   • Click "Mark as Read"
   • ✅ Notification status changes
   • Create a new request in another tab
   • ✅ New notification appears (if listener works)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4️⃣  ROLE-BASED ACCESS CONTROL TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 4.1: Donor Trying to Access Restricted Routes
   • Login as donor@test.com
   • Try to access:
     ✅ /create-request → Should show "Access Denied"
     ✅ /verify-requests → Should show "Access Denied"
     ✅ /analytics → Should show "Access Denied"
     ✅ /admin → Should show "Access Denied"

📝 Test 4.2: Receiver Trying to Access Restricted Routes
   • Login as receiver@test.com
   • Try to access:
     ✅ /verify-requests → Should show "Access Denied"
     ✅ /analytics → Should show "Access Denied"
     ✅ /admin → Should show "Access Denied"
     ✅ /donation-history → Should show "Access Denied"

📝 Test 4.3: NGO Trying to Access Admin Panel
   • Login as ngo@test.com
   • Try to access:
     ✅ /admin → Should show "Access Denied"
     ✅ /verify-requests → Should work
     ✅ /analytics → Should work

📝 Test 4.4: Unauthenticated Access
   • Logout (or use incognito)
   • Try to access:
     ✅ /dashboard → Redirects to /login
     ✅ /requests → Redirects to /login
     ✅ /create-request → Redirects to /login
     ✅ Any protected route → Redirects to /login

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5️⃣  FORM VALIDATION & ERROR HANDLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 5.1: Login Form Validation
   • Go to /login
   • Try submitting with:
     - Empty email → Error displays
     - Invalid email format → Error displays
     - Wrong password → Error: "Failed to log in"
     - Correct credentials → Success

📝 Test 5.2: Register Form Validation
   • Go to /register
   • Try submitting with:
     - Empty fields → Validation errors
     - Mismatched passwords → Error: "Passwords do not match"
     - Short password (< 6 chars) → Error message
     - Existing email → Firebase error displays
     - Valid data → Success, redirects to /dashboard

📝 Test 5.3: Create Request Form Validation
   • Login as receiver, go to /create-request
   • Try submitting with:
     - Empty location → Validation error
     - Empty description → Validation error
     - All fields filled → Success

📝 Test 5.4: Chat Message Validation
   • Go to /chat
   • Try sending:
     - Empty message → Button disabled or error
     - Valid message → Sends successfully

📝 Test 5.5: Rating Form Validation
   • Go to /ratings, open rating modal
   • Try submitting:
     - No star selected → Error or disabled
     - Stars only (no review) → Should work
     - Stars + review → Success

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
6️⃣  UI/UX & RESPONSIVE TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 6.1: Loading States
   • During login:
     ✅ Button shows "Logging in..." or disabled
   • During data fetch:
     ✅ Spinner or skeleton loader displays
   • During form submission:
     ✅ Submit button disabled

📝 Test 6.2: Empty States
   • No requests: ✅ "No requests found" message
   • No conversations: ✅ "No conversations" message
   • No notifications: ✅ Empty state display
   • No donations: ✅ "No donation history" message

📝 Test 6.3: Error States
   • Network error: ✅ Error message displays
   • Firestore permission denied: ✅ Error handled
   • Invalid route: ✅ Redirects to home

📝 Test 6.4: Responsive Design
   • Resize browser window:
     ✅ Mobile view (< 768px): Layout adapts
     ✅ Tablet view (768-1024px): Grid adjusts
     ✅ Desktop view (> 1024px): Full layout
   • Check on actual devices if possible

📝 Test 6.5: Visual Feedback
   • Hover over buttons: ✅ Color changes
   • Click links: ✅ Smooth transitions
   • Status badges: ✅ Color-coded properly
   • Icons: ✅ Display correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
7️⃣  REAL-TIME FEATURES TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 7.1: Real-Time Chat
   • Open two browsers (or browser + incognito)
   • Login as different users in each
   • Both go to /chat
   • Send message from Browser 1
   • ✅ Message appears in Browser 2 without refresh

📝 Test 7.2: Real-Time Notifications
   • Open two browsers
   • Browser 1: Login as receiver
   • Browser 2: Login as admin
   • Browser 2: Verify a request
   • Browser 1: Go to /notifications
   • ✅ New notification appears without refresh

📝 Test 7.3: Dashboard Updates
   • Create request while on dashboard
   • ✅ Stats update (may need refresh depending on implementation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
8️⃣  BROWSER CONSOLE CHECKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open Browser DevTools (F12) → Console Tab

📝 Test 8.1: Check for Errors
   • Navigate through all pages
   • ✅ No red error messages
   • ✅ No uncaught exceptions
   • Yellow warnings (ESLint) are acceptable

📝 Test 8.2: Check Network Tab
   • Filter by Fetch/XHR
   • Create a request
   • ✅ Firestore API calls succeed (status 200)
   • ✅ No 401/403 errors

📝 Test 8.3: Check Firebase Connection
   • Open Console and run:
     firebase.apps.length > 0
   • ✅ Should return true (Firebase initialized)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9️⃣  FIRESTORE DATABASE VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Open Firebase Console → Firestore Database

📝 Test 9.1: Collections Exist
   ✅ users
   ✅ requests
   ✅ notifications
   ✅ conversations
   ✅ messages
   ✅ donations
   ✅ ratings

📝 Test 9.2: Document Structure
   • Check 'users' collection:
     ✅ Has fields: uid, email, role, name, verified
   • Check 'requests' collection:
     ✅ Has fields: type, urgency, location, status, receiverId
   • Check 'notifications' collection:
     ✅ Has fields: userId, message, status, timestamp

📝 Test 9.3: Data Integrity
   • Create a request
   • ✅ Document created with correct data
   • Verify a request
   • ✅ Status field updated
   • Delete a user (if admin function exists)
   • ✅ Document removed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔟  EDGE CASES & STRESS TESTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Test 10.1: Rapid Actions
   • Click submit button multiple times quickly
   • ✅ Should not create duplicates
   • ✅ Button should disable during submission

📝 Test 10.2: Long Text Input
   • Enter very long description (1000+ chars)
   • ✅ Should handle gracefully
   • ✅ No UI breaking

📝 Test 10.3: Special Characters
   • Enter special chars in forms: <script>alert('XSS')</script>
   • ✅ Should be sanitized/escaped
   • ✅ No script execution

📝 Test 10.4: Simultaneous Users
   • Open 5+ tabs with different users
   • Perform actions simultaneously
   • ✅ Data consistency maintained
   • ✅ No conflicts

📝 Test 10.5: Session Expiry
   • Login and wait (or manually expire session)
   • Try to perform action
   • ✅ Should redirect to login or show error

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ TESTING COMPLETE!

📊 Results Summary:
   • Total Tests: 100+
   • Passed: _____
   • Failed: _____
   • Skipped: _____

📝 Issues Found:
   1. ____________________
   2. ____________________
   3. ____________________

🎉 If all tests pass, the application is PRODUCTION READY!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
