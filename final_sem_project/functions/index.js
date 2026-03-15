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

const GEMINI_MODEL = 'gemini-1.5-flash';
const BOT_SYSTEM_PROMPT = [
  'You are MediBot, an assistant inside a blood donation platform called MediReach.',
  'Give practical, concise, and safe guidance for donor/receiver coordination.',
  'Never claim to be a doctor, do not provide diagnoses, and advise emergency care for urgent medical danger.',
  'Keep responses under 120 words unless the user asks for details.'
].join(' ');

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

exports.generateGeminiReply = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required.');
  }

  const apiKey = process.env.GEMINI_API_KEY || functions.config()?.gemini?.key;
  if (!apiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Gemini API key is not configured on Cloud Functions.'
    );
  }

  const userMessage = (data?.message || '').toString().trim();
  const history = Array.isArray(data?.history) ? data.history : [];

  if (!userMessage) {
    throw new functions.https.HttpsError('invalid-argument', 'Message is required.');
  }

  const normalizedHistory = history
    .slice(-8)
    .map((entry) => ({
      role: entry?.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: (entry?.text || '').toString().slice(0, 600) }]
    }))
    .filter((entry) => entry.parts[0].text.length > 0);

  const requestBody = {
    system_instruction: {
      parts: [{ text: BOT_SYSTEM_PROMPT }]
    },
    contents: [
      ...normalizedHistory,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 220
    }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new functions.https.HttpsError('internal', 'Gemini API request failed.');
    }

    const result = await response.json();
    const reply = result?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      ?.trim();

    if (!reply) {
      throw new functions.https.HttpsError('internal', 'Gemini returned an empty response.');
    }

    return { reply };
  } catch (error) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    console.error('generateGeminiReply failed:', error);
    throw new functions.https.HttpsError('internal', 'Unable to generate a reply right now.');
  }
});
