# 🏥 MediReach - Global Health Resource & Donor Network

A humanitarian web-based platform connecting **donors**, **receivers (patients/families)**, **NGOs**, and **hospitals** in real-time to bridge the gap between people in medical need and verified resources.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Firebase Configuration](#firebase-configuration)
- [User Roles](#user-roles)
- [Application Flow](#application-flow)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

**MediReach** ensures transparency, reliability, and immediate action in medical emergencies like accidents, surgeries, or resource shortages by:

- Enabling verified and secure connections between donors and those in need
- Ensuring authenticity through verification and tracking
- Reducing emergency response time using **AI-based matching** and **geolocation services**
- Maintaining a scalable global network

## ✨ Features

### Core Features
- 🔐 **Role-based Authentication** - Admin, NGO/Hospital, Donor, and Receiver roles
- 🩸 **Resource Management** - Blood, Plasma, Oxygen, Medicines, and more
- ✅ **Verification System** - Multi-level verification by admins and NGOs
- 🤖 **AI Donor Matching** - Smart algorithms for urgent request matching
- 📍 **Geolocation Services** - Location-based donor discovery
- 🔔 **Real-time Notifications** - Firebase Cloud Messaging integration
- 📊 **Analytics Dashboard** - Insights for admins and NGOs
- 📱 **Responsive Design** - Works on all devices

### User-Specific Features

**For Donors:**
- Create donor profile with blood group and availability
- Receive notifications for nearby urgent requests
- Track donation history and contributions
- Update availability status

**For Receivers:**
- Submit urgent resource requests
- Track request status in real-time
- Connect with verified donors and NGOs
- Receive AI-matched donor suggestions

**For NGOs/Hospitals:**
- Verify and approve resource requests
- Monitor donation fulfillment
- Access analytics and reports
- Manage organizational profile

**For Admins:**
- User and organization verification
- Complete system oversight
- Analytics and reporting
- Platform management

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Leaflet.js** - Interactive maps

### Backend
- **Firebase Authentication** - User management
- **Firebase Firestore** - NoSQL database
- **Firebase Cloud Messaging** - Push notifications
- **Firebase Storage** - File storage

### Planned AI/ML Module
- **Python + Flask** - AI microservice
- **Scikit-learn** - Machine learning
- **Pandas** - Data processing

## 📁 Project Structure

```
medireach/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Dashboard/
│   │   │   └── Dashboard.js
│   │   ├── Layout/
│   │   │   └── Navbar.js
│   │   ├── Home.js
│   │   └── ProtectedRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── firebase/
│   │   └── config.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd final_sem_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (see next section)

4. **Start development server**
   ```bash
   npm start
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔥 Firebase Configuration

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Follow the setup wizard

### Step 2: Enable Services

1. **Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google providers

2. **Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

3. **Storage** (optional)
   - Go to Storage
   - Get started with default rules

### Step 3: Get Configuration

1. Go to Project Settings > Your Apps
2. Click "Add app" > Web
3. Copy the Firebase configuration object

### Step 4: Update Config File

Replace the config in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Step 5: Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    match /requests/{requestId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      (request.resource.data.receiverId == request.auth.uid ||
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['receiver', 'ngo', 'hospital', 'admin']);
      allow update: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'ngo', 'hospital'];
    }
  }
}
```

## 👥 User Roles

| Role | Permissions | Features |
|------|-------------|----------|
| **Admin** | Full access | User verification, system management, analytics |
| **NGO/Hospital** | Verify requests, track donations | Request verification, donation monitoring, reports |
| **Donor** | View requests, respond to matches | Donation offers, availability management, history |
| **Receiver** | Create requests, track status | Request submission, donor connection, tracking |
| **Guest** | View public info | Browse resources, registration |

## 🔄 Application Flow

1. **Registration & Authentication**
   - User selects role (Donor/Receiver/NGO/Admin)
   - Firebase Authentication verifies identity
   - User data stored in Firestore
   - NGO/Hospital accounts require admin approval

2. **Profile Setup**
   - Complete role-specific profile information
   - Donors: blood group, location, availability
   - Receivers: contact info, location
   - NGOs: organization details, verification docs

3. **Resource Request Flow**
   - Receiver submits request (type, urgency, location)
   - Request enters verification queue
   - Admin/NGO verifies authenticity
   - Verified requests become visible

4. **Donor Matching**
   - AI analyzes location, urgency, availability
   - Top donors are notified
   - Secure contact information exchange
   - Status tracking and updates

5. **Fulfillment & Tracking**
   - Real-time status updates
   - NGO/Admin monitoring
   - Completion confirmation
   - Feedback collection

## 🔮 Future Enhancements

- [ ] AI/ML microservice for intelligent matching
- [ ] Blockchain integration for donation traceability
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] AI chatbot for instant help
- [ ] Integration with WHO/Red Cross databases
- [ ] Advanced analytics and reporting
- [ ] SMS notifications
- [ ] Video consultation features
- [ ] Payment gateway integration

## 📊 Database Schema

### Users Collection
```javascript
{
  uid: string,
  email: string,
  name: string,
  role: 'admin' | 'donor' | 'receiver' | 'ngo' | 'hospital',
  phone: string,
  location: string,
  verified: boolean,
  availability: boolean, // for donors
  bloodGroup: string, // for donors
  organizationName: string, // for NGO/hospital
  createdAt: timestamp
}
```

### Requests Collection
```javascript
{
  requestId: string,
  type: 'Blood' | 'Plasma' | 'Oxygen' | 'Medicine' | 'Other',
  urgency: 'Critical' | 'High' | 'Medium' | 'Low',
  location: string,
  status: 'Pending' | 'Verified' | 'Matched' | 'In Progress' | 'Completed',
  receiverId: string,
  description: string,
  matchedDonors: array,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Notifications Collection
```javascript
{
  notificationId: string,
  userId: string,
  message: string,
  type: string,
  status: 'read' | 'unread',
  timestamp: timestamp
}
```

## 🤝 Contributing

This is a semester project. For any suggestions or improvements, please reach out to the project team.

## 📄 License

This project is created for educational purposes as part of a semester project.

## 👨‍💻 Development Team

- Project: MediReach - Global Health Resource & Donor Network
- Institution: [Your University]
- Semester: 6th
- Year: 2025

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team

---

**MediReach** - Connecting Hope, Saving Lives 💙


