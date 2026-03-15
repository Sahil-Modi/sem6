# Level 3 Data Flow Diagram - Blood Donation Management System

## Overview
This document contains the Level 3 Data Flow Diagrams showing detailed processes, data stores, and data flows for the entire Blood Donation Management System.

---

## 1. Authentication & User Management Subsystem

### Process 1.1: User Registration

```
External Entity: User
    |
    | (Registration Details)
    v
[1.1.1 Validate Registration Data]
    |
    | (Validated User Data)
    v
[1.1.2 Check Duplicate Email]
    |<---- D1: Users (Existing Emails)
    |
    | (Unique User Data)
    v
[1.1.3 Hash Password]
    |
    | (Hashed Credentials)
    v
[1.1.4 Create User Account]
    |----> D1: Users (Store User Profile)
    |
    | (User ID + Auth Token)
    v
[1.1.5 Send Welcome Email]
    |----> D7: Email Queue
    |
    | (Success Response)
    v
External Entity: User
```

**Data Stores:**
- D1: Users (Firebase Authentication + Firestore)
- D7: Email Queue

**Inputs:**
- Name, Email, Password, Blood Type, Contact, Address, Location Coordinates, User Type

**Outputs:**
- User ID, Authentication Token, Welcome Email

---

### Process 1.2: User Login

```
External Entity: User
    |
    | (Login Credentials)
    v
[1.2.1 Validate Input Format]
    |
    | (Email, Password)
    v
[1.2.2 Authenticate Credentials]
    |<---- D1: Users (Stored Credentials)
    |
    | (User ID)
    v
[1.2.3 Generate Session Token]
    |
    | (Session Token)
    v
[1.2.4 Update Last Login]
    |----> D1: Users (Last Login Timestamp)
    |
    | (Auth Token + User Data)
    v
[1.2.5 Load User Profile]
    |<---- D1: Users (Profile Data)
    |
    | (Complete User Context)
    v
External Entity: User
```

**Data Stores:**
- D1: Users

**Inputs:**
- Email, Password

**Outputs:**
- Authentication Token, User Profile, Session Data

---

## 2. Blood Request Management Subsystem

### Process 2.1: Create Blood Request

```
External Entity: Requester
    |
    | (Request Details)
    v
[2.1.1 Validate Request Data]
    |
    | (Validated Data)
    v
[2.1.2 Check User Authorization]
    |<---- D1: Users (User Role)
    |
    | (Authorized Request)
    v
[2.1.3 Add Request Metadata]
    |
    | (Enriched Request)
    v
[2.1.4 Store Request]
    |----> D2: Blood Requests
    |
    | (Request ID)
    v
[2.1.5 Trigger AI Matching]
    |----> [3.1 AI Matching Process]
    |
    | (Request Created)
    v
External Entity: Requester
```

**Data Stores:**
- D1: Users
- D2: Blood Requests

**Inputs:**
- Blood Type, Units Needed, Urgency Level, Hospital Name, Patient Details, Location

**Outputs:**
- Request ID, Confirmation

---

### Process 2.2: View/Search Requests

```
External Entity: User
    |
    | (Search Criteria)
    v
[2.2.1 Parse Search Parameters]
    |
    | (Filter Criteria)
    v
[2.2.2 Query Requests Database]
    |<---- D2: Blood Requests
    |
    | (Matching Requests)
    v
[2.2.3 Filter by User Role]
    |<---- D1: Users (User Permissions)
    |
    | (Authorized Requests)
    v
[2.2.4 Sort & Paginate]
    |
    | (Ordered Results)
    v
[2.2.5 Enrich with User Data]
    |<---- D1: Users (Requester Info)
    |
    | (Complete Request List)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D2: Blood Requests

**Inputs:**
- Blood Type Filter, Location Filter, Urgency Filter, Status Filter

**Outputs:**
- List of Blood Requests with Details

---

### Process 2.3: Update Blood Request

```
External Entity: Requester
    |
    | (Update Data + Request ID)
    v
[2.3.1 Verify Request Ownership]
    |<---- D2: Blood Requests
    |<---- D1: Users
    |
    | (Authorized Update)
    v
[2.3.2 Validate Update Data]
    |
    | (Valid Changes)
    v
[2.3.3 Update Request Status]
    |----> D2: Blood Requests
    |
    | (Updated Request)
    v
[2.3.4 Notify Interested Donors]
    |----> [5.1 Create Notification]
    |
    | (Update Confirmation)
    v
External Entity: Requester
```

**Data Stores:**
- D1: Users
- D2: Blood Requests

**Inputs:**
- Request ID, Updated Fields, New Status

**Outputs:**
- Update Confirmation, Notifications Sent

---

### Process 2.4: Verify Blood Request (Admin)

```
External Entity: Admin
    |
    | (Request ID + Verification Decision)
    v
[2.4.1 Verify Admin Authorization]
    |<---- D1: Users (User Role)
    |
    | (Authorized Admin)
    v
[2.4.2 Load Request Details]
    |<---- D2: Blood Requests
    |
    | (Request Data)
    v
[2.4.3 Update Verification Status]
    |----> D2: Blood Requests (Verified: true/false)
    |
    | (Verification Decision)
    v
[2.4.4 Create Audit Log]
    |----> D8: Audit Logs
    |
    | (Verified Request)
    v
[2.4.5 Notify Requester]
    |----> [5.1 Create Notification]
    |
    | (Verification Complete)
    v
External Entity: Admin
```

**Data Stores:**
- D1: Users
- D2: Blood Requests
- D8: Audit Logs

**Inputs:**
- Request ID, Verification Decision, Admin Notes

**Outputs:**
- Updated Request Status, Notification to Requester

---

## 3. AI Matching Subsystem

### Process 3.1: AI-Based Donor Matching

```
[2.1 Create Request] OR [2.3 Update Request]
    |
    | (Request ID)
    v
[3.1.1 Extract Request Parameters]
    |<---- D2: Blood Requests
    |
    | (Blood Type, Location, Urgency)
    v
[3.1.2 Query Eligible Donors]
    |<---- D1: Users (Blood Type, Location, Availability)
    |
    | (Potential Donors List)
    v
[3.1.3 Calculate Match Scores]
    |
    | - Distance Score
    | - Blood Type Compatibility
    | - Donation History Score
    | - Availability Score
    |<---- D3: Donation History
    |
    | (Scored Donors)
    v
[3.1.4 Rank Donors by ML Model]
    |<---- External: AI Matcher Service (Python)
    |
    | (Ranked Donor List)
    v
[3.1.5 Store Match Results]
    |----> D9: Match Results
    |
    | (Top Matches)
    v
[3.1.6 Send Notifications to Top Donors]
    |----> [5.1 Create Notification]
    |
    | (Matching Complete)
    v
Return to Calling Process
```

**Data Stores:**
- D1: Users
- D2: Blood Requests
- D3: Donation History
- D9: Match Results

**External Services:**
- AI Matcher Service (Flask/Python)

**Inputs:**
- Request ID, Blood Type, Location, Urgency

**Outputs:**
- Ranked List of Matching Donors, Notifications

---

## 4. Donor Discovery Subsystem

### Process 4.1: Donor Directory Search

```
External Entity: User
    |
    | (Search Filters)
    v
[4.1.1 Parse Search Criteria]
    |
    | (Blood Type, Location Radius, Availability)
    v
[4.1.2 Query Donor Database]
    |<---- D1: Users (role = 'donor')
    |
    | (Matching Donors)
    v
[4.1.3 Calculate Distances]
    |<---- External: Geocoding Service
    |
    | (Donors with Distance)
    v
[4.1.4 Filter by Privacy Settings]
    |<---- D1: Users (Privacy Preferences)
    |
    | (Public Donor Profiles)
    v
[4.1.5 Enrich with Statistics]
    |<---- D3: Donation History
    |<---- D6: Ratings
    |
    | (Complete Donor Profiles)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D3: Donation History
- D6: Ratings

**External Services:**
- Geocoding Service (Google Maps API)

**Inputs:**
- Blood Type, Location, Search Radius

**Outputs:**
- List of Donor Profiles with Statistics

---

### Process 4.2: Donor Map Visualization

```
External Entity: User
    |
    | (Map View Request + Filters)
    v
[4.2.1 Get User Location]
    |
    | (Coordinates)
    v
[4.2.2 Query Donors in Radius]
    |<---- D1: Users (Location, Blood Type)
    |
    | (Nearby Donors)
    v
[4.2.3 Format Map Markers]
    |
    | (Marker Data: lat, lng, info)
    v
[4.2.4 Cluster Nearby Donors]
    |
    | (Clustered Markers)
    v
[4.2.5 Generate Map Data]
    |
    | (Map JSON)
    v
External Entity: User
```

**Data Stores:**
- D1: Users

**Inputs:**
- User Location, Blood Type Filter, Radius

**Outputs:**
- Map Markers with Donor Information

---

### Process 4.3: View Donor Profile

```
External Entity: User
    |
    | (Donor ID)
    v
[4.3.1 Load Donor Profile]
    |<---- D1: Users
    |
    | (Donor Data)
    v
[4.3.2 Check Privacy Settings]
    |
    | (Visible Fields)
    v
[4.3.3 Load Donation Statistics]
    |<---- D3: Donation History
    |
    | (Donations Count, Last Donation)
    v
[4.3.4 Load Ratings & Reviews]
    |<---- D6: Ratings
    |
    | (Average Rating, Reviews)
    v
[4.3.5 Check Availability Status]
    |<---- D1: Users (Last Active, Availability)
    |
    | (Complete Profile)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D3: Donation History
- D6: Ratings

**Inputs:**
- Donor ID

**Outputs:**
- Complete Donor Profile with Statistics

---

## 5. Notification Subsystem

### Process 5.1: Create Notification

```
[Multiple Processes]
    |
    | (Notification Data)
    v
[5.1.1 Format Notification Message]
    |
    | (Formatted Message)
    v
[5.1.2 Determine Recipients]
    |<---- D1: Users (User Preferences)
    |
    | (Recipient List)
    v
[5.1.3 Check Notification Settings]
    |<---- D10: Notification Settings
    |
    | (Enabled Recipients)
    v
[5.1.4 Store Notification]
    |----> D4: Notifications
    |
    | (Notification ID)
    v
[5.1.5 Send Push Notification]
    |<---- D1: Users (FCM Tokens)
    |----> External: Firebase Cloud Messaging
    |
    | (Delivery Status)
    v
[5.1.6 Update Notification Status]
    |----> D4: Notifications (Sent: true)
    |
    | (Notification Created)
    v
Return to Calling Process
```

**Data Stores:**
- D1: Users
- D4: Notifications
- D10: Notification Settings

**External Services:**
- Firebase Cloud Messaging

**Inputs:**
- Message Content, Recipient IDs, Notification Type

**Outputs:**
- Notification ID, Delivery Status

---

### Process 5.2: View Notifications

```
External Entity: User
    |
    | (User ID)
    v
[5.2.1 Query User Notifications]
    |<---- D4: Notifications
    |
    | (User's Notifications)
    v
[5.2.2 Sort by Timestamp]
    |
    | (Ordered Notifications)
    v
[5.2.3 Mark as Read]
    |----> D4: Notifications (Read: true)
    |
    | (Notification List)
    v
External Entity: User
```

**Data Stores:**
- D4: Notifications

**Inputs:**
- User ID

**Outputs:**
- List of Notifications

---

### Process 5.3: Manage Notification Settings

```
External Entity: User
    |
    | (Preferences Update)
    v
[5.3.1 Validate Preferences]
    |
    | (Valid Settings)
    v
[5.3.2 Update User Preferences]
    |----> D10: Notification Settings
    |
    | (Updated Settings)
    v
[5.3.3 Update FCM Token]
    |----> D1: Users (FCM Token)
    |
    | (Confirmation)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D10: Notification Settings

**Inputs:**
- Email Notifications, Push Notifications, Notification Types

**Outputs:**
- Updated Preferences

---

## 6. Chat/Messaging Subsystem

### Process 6.1: Initiate Chat

```
External Entity: User A
    |
    | (Recipient ID, Initial Message)
    v
[6.1.1 Validate Participants]
    |<---- D1: Users (User IDs)
    |
    | (Valid Users)
    v
[6.1.2 Check Existing Conversation]
    |<---- D5: Chat Messages (conversation_id)
    |
    | (Conversation ID or NULL)
    v
[6.1.3 Create Conversation]
    |----> D5: Chat Messages (New Conversation)
    |
    | (Conversation ID)
    v
[6.1.4 Send First Message]
    |----> [6.2 Send Message]
    |
    | (Chat Started)
    v
External Entity: User A
```

**Data Stores:**
- D1: Users
- D5: Chat Messages

**Inputs:**
- Sender ID, Recipient ID, Initial Message

**Outputs:**
- Conversation ID

---

### Process 6.2: Send Message

```
External Entity: User
    |
    | (Conversation ID, Message, Attachments)
    v
[6.2.1 Validate Message]
    |
    | (Valid Message)
    v
[6.2.2 Check User Authorization]
    |<---- D5: Chat Messages (Conversation Participants)
    |
    | (Authorized)
    v
[6.2.3 Process Attachments]
    |----> D11: Storage (Upload Files)
    |
    | (Message + Attachment URLs)
    v
[6.2.4 Store Message]
    |----> D5: Chat Messages
    |
    | (Message ID, Timestamp)
    v
[6.2.5 Send Real-time Update]
    |----> External: Firebase Realtime Database
    |
    | (Message Sent)
    v
[6.2.6 Notify Recipient]
    |----> [5.1 Create Notification]
    |
    | (Delivery Confirmation)
    v
External Entity: User
```

**Data Stores:**
- D5: Chat Messages
- D11: Storage (Firebase Storage)

**External Services:**
- Firebase Realtime Database

**Inputs:**
- Conversation ID, Message Text, Attachments

**Outputs:**
- Message ID, Timestamp

---

### Process 6.3: Retrieve Chat History

```
External Entity: User
    |
    | (Conversation ID, Pagination)
    v
[6.3.1 Verify User Access]
    |<---- D5: Chat Messages (Participants)
    |
    | (Authorized)
    v
[6.3.2 Query Messages]
    |<---- D5: Chat Messages
    |
    | (Message List)
    v
[6.3.3 Load Participant Info]
    |<---- D1: Users (Names, Photos)
    |
    | (Enriched Messages)
    v
[6.3.4 Mark Messages as Read]
    |----> D5: Chat Messages (Read Status)
    |
    | (Chat History)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D5: Chat Messages

**Inputs:**
- Conversation ID, Page Number

**Outputs:**
- List of Messages with Sender Info

---

## 7. Ratings & Reviews Subsystem

### Process 7.1: Submit Rating

```
External Entity: User
    |
    | (Donor ID, Rating, Review Text)
    v
[7.1.1 Validate Rating Data]
    |
    | (Valid Rating: 1-5)
    v
[7.1.2 Check Donation History]
    |<---- D3: Donation History
    |
    | (Verified Interaction)
    v
[7.1.3 Check Duplicate Rating]
    |<---- D6: Ratings
    |
    | (No Duplicate)
    v
[7.1.4 Store Rating]
    |----> D6: Ratings
    |
    | (Rating ID)
    v
[7.1.5 Update Donor Statistics]
    |----> D1: Users (Average Rating, Rating Count)
    |
    | (Rating Submitted)
    v
[7.1.6 Notify Donor]
    |----> [5.1 Create Notification]
    |
    | (Confirmation)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D3: Donation History
- D6: Ratings

**Inputs:**
- Donor ID, Rating (1-5), Review Text

**Outputs:**
- Rating ID, Updated Donor Statistics

---

### Process 7.2: View Ratings

```
External Entity: User
    |
    | (Donor ID)
    v
[7.2.1 Query Donor Ratings]
    |<---- D6: Ratings
    |
    | (Rating List)
    v
[7.2.2 Calculate Statistics]
    |
    | (Avg Rating, Distribution)
    v
[7.2.3 Load Reviewer Info]
    |<---- D1: Users (Names)
    |
    | (Ratings with Reviewers)
    v
[7.2.4 Sort & Filter]
    |
    | (Ordered Ratings)
    v
External Entity: User
```

**Data Stores:**
- D1: Users
- D6: Ratings

**Inputs:**
- Donor ID, Sort Criteria

**Outputs:**
- List of Ratings with Statistics

---

## 8. Analytics & Reporting Subsystem

### Process 8.1: Generate Dashboard Analytics

```
External Entity: Admin
    |
    | (Date Range, Metrics)
    v
[8.1.1 Verify Admin Access]
    |<---- D1: Users (Role)
    |
    | (Authorized)
    v
[8.1.2 Query User Statistics]
    |<---- D1: Users
    |
    | (User Counts, Growth)
    v
[8.1.3 Query Request Statistics]
    |<---- D2: Blood Requests
    |
    | (Requests by Status, Type)
    v
[8.1.4 Query Donation Statistics]
    |<---- D3: Donation History
    |
    | (Donations Over Time)
    v
[8.1.5 Calculate Blood Type Distribution]
    |<---- D1: Users
    |<---- D2: Blood Requests
    |
    | (Blood Type Stats)
    v
[8.1.6 Generate Location Analytics]
    |<---- D1: Users
    |<---- D2: Blood Requests
    |
    | (Geographic Distribution)
    v
[8.1.7 Format Dashboard Data]
    |
    | (Charts, Graphs, KPIs)
    v
External Entity: Admin
```

**Data Stores:**
- D1: Users
- D2: Blood Requests
- D3: Donation History

**Inputs:**
- Date Range, Filter Criteria

**Outputs:**
- Dashboard Analytics (Charts, Statistics, KPIs)

---

### Process 8.2: Export Reports

```
External Entity: Admin
    |
    | (Report Type, Parameters)
    v
[8.2.1 Generate Report Data]
    |<---- [8.1 Analytics Process]
    |
    | (Report Data)
    v
[8.2.2 Format Report]
    |
    | (CSV/PDF/Excel Format)
    v
[8.2.3 Generate Download Link]
    |----> D11: Storage
    |
    | (Download URL)
    v
External Entity: Admin
```

**Data Stores:**
- D11: Storage

**Inputs:**
- Report Type, Date Range, Format

**Outputs:**
- Report File (CSV/PDF/Excel)

---

## 9. FAQ Management Subsystem

### Process 9.1: View FAQs

```
External Entity: User
    |
    | (Search Query, Category)
    v
[9.1.1 Query FAQ Database]
    |<---- D12: FAQs
    |
    | (Matching FAQs)
    v
[9.1.2 Filter by Category]
    |
    | (Filtered FAQs)
    v
[9.1.3 Sort by Relevance]
    |
    | (Ordered FAQs)
    v
External Entity: User
```

**Data Stores:**
- D12: FAQs

**Inputs:**
- Search Query, Category Filter

**Outputs:**
- List of FAQs

---

### Process 9.2: Manage FAQs (Admin)

```
External Entity: Admin
    |
    | (FAQ Data, Action)
    v
[9.2.1 Verify Admin Authorization]
    |<---- D1: Users
    |
    | (Authorized)
    v
[9.2.2 Validate FAQ Data]
    |
    | (Valid FAQ)
    v
[9.2.3 Create/Update/Delete FAQ]
    |<---> D12: FAQs
    |
    | (Operation Result)
    v
[9.2.4 Log Action]
    |----> D8: Audit Logs
    |
    | (Confirmation)
    v
External Entity: Admin
```

**Data Stores:**
- D1: Users
- D8: Audit Logs
- D12: FAQs

**Inputs:**
- Question, Answer, Category, Action (Create/Update/Delete)

**Outputs:**
- FAQ ID, Confirmation

---

## 10. Email Notification Subsystem

### Process 10.1: Send Email Notifications

```
[Various Processes]
    |
    | (Email Event)
    v
[10.1.1 Queue Email]
    |----> D7: Email Queue
    |
    | (Queue ID)
    v
[10.1.2 Process Email Queue]
    |<---- D7: Email Queue
    |
    | (Email Details)
    v
[10.1.3 Load Email Template]
    |<---- D13: Email Templates
    |
    | (Template)
    v
[10.1.4 Populate Template]
    |
    | (Formatted Email)
    v
[10.1.5 Send via Email Service]
    |----> External: Email Service (Gmail/SendGrid)
    |
    | (Delivery Status)
    v
[10.1.6 Update Queue Status]
    |----> D7: Email Queue (Sent/Failed)
    |
    | (Email Sent)
    v
Return to Calling Process
```

**Data Stores:**
- D7: Email Queue
- D13: Email Templates

**External Services:**
- Email Service (Gmail API, SendGrid)

**Inputs:**
- Recipient Email, Template ID, Variables

**Outputs:**
- Delivery Status

---

## Data Store Summary

| ID | Data Store Name | Description |
|----|----------------|-------------|
| D1 | Users | User profiles, credentials, preferences |
| D2 | Blood Requests | Blood donation requests |
| D3 | Donation History | Completed donations records |
| D4 | Notifications | In-app notifications |
| D5 | Chat Messages | Chat conversations and messages |
| D6 | Ratings | Ratings and reviews for donors |
| D7 | Email Queue | Pending and sent emails |
| D8 | Audit Logs | System activity logs |
| D9 | Match Results | AI matching results cache |
| D10 | Notification Settings | User notification preferences |
| D11 | Storage | File storage (attachments, images) |
| D12 | FAQs | Frequently asked questions |
| D13 | Email Templates | Email templates |

---

## External Entities

1. **User** - General platform user
2. **Donor** - User with donor role
3. **Requester** - User requesting blood
4. **Admin** - System administrator
5. **AI Matcher Service** - Python-based ML service
6. **Firebase Cloud Messaging** - Push notification service
7. **Firebase Realtime Database** - Real-time data sync
8. **Geocoding Service** - Google Maps API
9. **Email Service** - Email delivery service
10. **Firebase Storage** - File storage service

---

## Technology Stack Reference

### Frontend
- **React.js** - UI Components
- **Firebase SDK** - Authentication & Realtime updates
- **Google Maps API** - Location services

### Backend
- **Firebase Functions** - Serverless backend
- **Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **Firebase Storage** - File storage

### AI/ML Service
- **Python/Flask** - AI Matcher service
- **Machine Learning Models** - Donor ranking algorithms

### Communication
- **Firebase Cloud Messaging** - Push notifications
- **Email Service** - Email notifications
- **Firebase Realtime Database** - Chat messaging

---

## Key Data Flows Summary

1. **User Registration → Profile Creation → Welcome Email**
2. **Create Request → AI Matching → Notify Donors**
3. **Donor Search → Filter by Location → Display Map**
4. **Send Message → Store in DB → Real-time Push → Notify Recipient**
5. **Submit Rating → Update Statistics → Notify Donor**
6. **Generate Analytics → Query All Data Stores → Format Dashboard**
7. **Admin Verify Request → Update Status → Notify Requester**
8. **AI Matching → Calculate Scores → Rank Donors → Send Notifications**

---

## Process Hierarchy

```
Level 0: Blood Donation Management System
    |
    +-- Level 1: Major Subsystems
        |
        +-- 1.0 Authentication & User Management
        +-- 2.0 Blood Request Management
        +-- 3.0 AI Matching
        +-- 4.0 Donor Discovery
        +-- 5.0 Notifications
        +-- 6.0 Chat/Messaging
        +-- 7.0 Ratings & Reviews
        +-- 8.0 Analytics & Reporting
        +-- 9.0 FAQ Management
        +-- 10.0 Email Notifications
            |
            +-- Level 2: Sub-processes (e.g., 2.1, 2.2, 2.3, 2.4)
                |
                +-- Level 3: Detailed Processes (e.g., 2.1.1, 2.1.2, 2.1.3)
```

---

## Notes

- All processes include validation and error handling
- Authentication checks occur at multiple levels
- Notification triggers are integrated across subsystems
- AI matching runs asynchronously
- Real-time updates use Firebase listeners
- All database operations use Firestore transactions where applicable
- Privacy settings are enforced at data retrieval level
- Audit logging occurs for admin actions
- Email queue processes in background
- File uploads use signed URLs for security

---

*Document Version: 1.0*  
*Last Updated: February 15, 2026*
