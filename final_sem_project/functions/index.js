/*
  Firebase Cloud Functions for MediReach
  
  Features:
  - Push notifications (FCM)
  - Email notifications (Nodemailer)
  - Automated triggers for user actions
  
  Deploy: firebase deploy --only functions
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Export email service functions
const emailService = require('./emailService');
exports.sendWelcomeEmail = emailService.sendWelcomeEmail;
exports.sendRequestVerifiedEmail = emailService.sendRequestVerifiedEmail;
exports.sendDonorMatchedEmail = emailService.sendDonorMatchedEmail;
exports.sendUrgentRequestEmails = emailService.sendUrgentRequestEmails;
exports.sendDailyDigest = emailService.sendDailyDigest;

exports.sendPush = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const { token, title, body, data } = req.body || {};
    if (!token) return res.status(400).send('Missing token');

    const message = {
      token,
      notification: {
        title: title || 'MediReach',
        body: body || ''
      },
      data: data || {}
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, result: response });
  } catch (err) {
    console.error('Error sending push', err);
    return res.status(500).json({ error: err.message });
  }
});
