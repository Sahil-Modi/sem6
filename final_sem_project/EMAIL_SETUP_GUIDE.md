# 📧 Email Notification Setup Guide

## Overview
MediReach now includes a comprehensive email notification system using **Firebase Cloud Functions** and **Nodemailer**. Users receive automated emails for key events throughout their journey.

---

## ✨ Features Implemented

### 1. **Welcome Email** 
- Triggered when new users register
- Beautiful branded template with call-to-action
- Introduces platform features

### 2. **Request Verified Email**
- Sent when admin/NGO/hospital verifies a blood request
- Includes tracking ID, blood group, and urgency level
- Direct link to view request status

### 3. **Donor Matched Email**
- Notifies receiver when a donor accepts their request
- Provides donor contact information
- Encourages coordination

### 4. **Request Completed Email**
- Confirmation when request is marked complete
- Thank you message
- Prompt to rate the experience

### 5. **Urgent Request Notifications**
- Sent to nearby available donors for Critical/High urgency requests
- Blood group specific targeting
- Quick action links

### 6. **Daily Digest Email (Scheduled)**
- Runs daily at 9 AM IST
- Personalized stats: pending requests, nearby opportunities, total donations
- Users can opt-in/out via preferences

---

## 🛠️ Setup Instructions

### Prerequisites
- Firebase project with Blaze (pay-as-you-go) plan
- Gmail account with App Password (or other email service)

### Step 1: Install Dependencies
```bash
cd functions
npm install firebase-functions nodemailer
```

### Step 2: Configure Email Credentials
Use Firebase CLI to set environment variables:

```bash
# Set your Gmail address
firebase functions:config:set email.user="your-email@gmail.com"

# Set your Gmail App Password (not regular password!)
firebase functions:config:set email.pass="your-app-password"
```

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Generate password for "Mail" → "Other (Custom name)"
5. Copy the 16-character password

### Step 3: Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### Step 4: Verify Deployment
Check Firebase Console → Functions to ensure all functions are deployed:
- ✅ sendWelcomeEmail
- ✅ sendRequestVerifiedEmail
- ✅ sendDonorMatchedEmail
- ✅ sendUrgentRequestEmails
- ✅ sendDailyDigest

---

## 📝 Email Preferences (Future Enhancement)

Add these fields to user profiles to allow email preferences:
- `emailNotifications` - Enable/disable all emails
- `emailDigest` - Enable/disable daily digest
- `urgentOnly` - Receive only urgent notifications

---

## 🎨 Email Templates

All templates feature:
- **Responsive design** - Looks great on all devices
- **Branded colors** - MediReach purple gradient
- **Clear CTAs** - Action buttons for quick access
- **Professional layout** - Clean, modern aesthetic

---

## 🔒 Security & Privacy

- Emails use no-reply sender address
- User data is only used for intended notifications
- Complies with email best practices (unsubscribe links can be added)
- Credentials stored securely in Firebase environment config

---

## 💰 Costs

Firebase Functions pricing (Blaze plan):
- **Invocations**: 2 million free per month
- **Compute time**: 400,000 GB-seconds free per month
- **Outbound networking**: 5GB free per month

Nodemailer with Gmail is **free** but has daily limits:
- 500 emails/day for regular Gmail
- 2000 emails/day for Google Workspace

For higher volume, consider:
- **SendGrid** - 100 emails/day free, then paid tiers
- **Mailgun** - 5000 emails/month free
- **AWS SES** - $0.10 per 1000 emails

---

## 🧪 Testing

Test individual functions using Firebase Emulator Suite:
```bash
firebase emulators:start --only functions
```

Or trigger manually from Firestore by creating/updating documents.

---

## 📊 Monitoring

Track email delivery in Firebase Console:
- **Functions → Logs** - See email sending activity
- **Error reporting** - Catch failed deliveries
- **Usage metrics** - Monitor costs

---

## 🚀 Next Steps

1. **Deploy functions**: `firebase deploy --only functions`
2. **Configure email credentials** using steps above
3. **Test welcome email** by registering a new user
4. **Monitor logs** for successful sends
5. **Add user preferences** in NotificationSettings component

---

## ⚠️ Important Notes

- Gmail App Passwords required (2FA must be enabled)
- Daily digest runs at 9 AM IST (can be customized in emailService.js)
- Ensure Firebase project is on Blaze plan
- Update `medireach.com` URLs to your actual domain before production

---

## 🐛 Troubleshooting

**Emails not sending?**
- Check Firebase Console → Functions → Logs for errors
- Verify email credentials: `firebase functions:config:get`
- Ensure users have valid email addresses in Firestore
- Check Gmail "Less secure app access" if using Gmail

**Function deployment failed?**
- Run `npm install` in functions directory
- Check Node.js version (v16+ required)
- Review error messages in terminal

---

## 📞 Support

If you encounter issues, check:
1. Firebase Functions documentation
2. Nodemailer documentation
3. Firebase Console error logs
4. Stack Overflow for common problems
