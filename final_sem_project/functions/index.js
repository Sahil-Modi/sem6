/*
  Example Firebase Cloud Function (HTTP) to send push notifications to a token.
  Deploy with the Firebase CLI from the functions/ directory.

  This is a minimal example to illustrate server-side FCM sending using the Admin SDK.
  In production you should secure this endpoint (auth, CORS, validation) or use callable functions.

  Steps:
  - cd functions
  - npm init -y
  - npm install firebase-admin firebase-functions
  - firebase deploy --only functions

  Example POST body: { "token": "<fcm_token>", "title": "Hello", "body": "Message body" }
*/

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

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
