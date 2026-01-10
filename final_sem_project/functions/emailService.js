const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Configure email service (Gmail example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().email.user, // Set via: firebase functions:config:set email.user="your-email@gmail.com"
    pass: functions.config().email.pass  // Set via: firebase functions:config:set email.pass="your-app-password"
  }
});

// Email templates
const templates = {
  welcome: (userName) => ({
    subject: '🎉 Welcome to MediReach!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to MediReach</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">Connecting Lives, One Drop at a Time</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333;">Hello ${userName}! 👋</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining MediReach! You're now part of a community dedicated to saving lives through blood donation.
          </p>
          <p style="color: #666; line-height: 1.6;">
            <strong>What you can do:</strong>
          </p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Find nearby blood donors in real-time</li>
            <li>Create urgent blood requests</li>
            <li>Track donation history and impact</li>
            <li>Connect with verified NGOs and hospitals</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://medireach.com/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #999; font-size: 12px;">
          <p>MediReach - Blood Donation Platform</p>
        </div>
      </div>
    `
  }),

  requestVerified: (userName, requestId, bloodGroup, urgency) => ({
    subject: `✅ Your Blood Request (${requestId}) is Verified`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #10b981; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Request Verified! ✅</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333;">Hello ${userName},</h2>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your blood request has been verified and is now visible to donors.
          </p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Request ID:</strong> ${requestId}</p>
            <p style="margin: 5px 0;"><strong>Blood Group:</strong> ${bloodGroup}</p>
            <p style="margin: 5px 0;"><strong>Urgency:</strong> ${urgency}</p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            We've notified nearby donors. You'll receive notifications when donors accept your request.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://medireach.com/requests/${requestId}" 
               style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Request Status
            </a>
          </div>
        </div>
      </div>
    `
  }),

  donorMatched: (userName, donorName, donorPhone, requestId, bloodGroup) => ({
    subject: `🎉 A Donor Accepted Your Request!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #8b5cf6; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Donor Found! 🎉</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333;">Excellent News, ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            A donor has accepted your blood request. Here are their details:
          </p>
          <div style="background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Donor Name:</strong> ${donorName}</p>
            <p style="margin: 5px 0;"><strong>Contact:</strong> ${donorPhone}</p>
            <p style="margin: 5px 0;"><strong>Blood Group:</strong> ${bloodGroup}</p>
          </p>
          <p style="color: #666; line-height: 1.6;">
            Please coordinate with the donor to arrange the donation. Don't forget to mark the request as completed once done!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://medireach.com/requests/${requestId}" 
               style="background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Full Details
            </a>
          </div>
        </div>
      </div>
    `
  }),

  requestCompleted: (userName, requestId, bloodGroup) => ({
    subject: `✅ Request Completed - Thank You!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #059669; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Request Completed! ✅</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333;">Congratulations, ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Your blood request (${requestId}) for ${bloodGroup} has been marked as completed.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Thank you for using MediReach. We hope this platform helped you find the blood you needed quickly and efficiently.
          </p>
          <div style="background: #ecfdf5; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0; color: #065f46;">
              💡 <strong>Tip:</strong> Consider rating your experience to help other users make informed decisions.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://medireach.com/ratings" 
               style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Rate Your Experience
            </a>
          </div>
        </div>
      </div>
    `
  }),

  urgentRequest: (donorName, bloodGroup, location, urgency, requestId) => ({
    subject: `🚨 Urgent: ${bloodGroup} Blood Needed Near You`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🚨 Urgent Blood Needed!</h1>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333;">Hello ${donorName},</h2>
          <p style="color: #666; line-height: 1.6;">
            An urgent blood request has been posted near your location. Your help could save a life!
          </p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Blood Group Needed:</strong> ${bloodGroup}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
            <p style="margin: 5px 0;"><strong>Urgency:</strong> <span style="color: #dc2626;">${urgency}</span></p>
          </div>
          <p style="color: #666; line-height: 1.6;">
            If you're available to donate, please respond as soon as possible. Every minute counts!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://medireach.com/requests/${requestId}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Request & Respond
            </a>
          </div>
        </div>
      </div>
    `
  }),

  dailyDigest: (userName, pendingRequests, nearbyRequests, stats) => ({
    subject: `📊 Your Daily MediReach Digest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">📊 Daily Digest</h1>
          <p style="color: #f0f0f0; margin: 10px 0 0 0;">${new Date().toDateString()}</p>
        </div>
        <div style="padding: 30px; background: white;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Here's your daily summary from MediReach:
          </p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0;">
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #0369a1; margin: 0;">${pendingRequests}</p>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Pending Requests</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="font-size: 32px; font-weight: bold; color: #d97706; margin: 0;">${nearbyRequests}</p>
              <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Nearby Requests</p>
            </div>
          </div>

          ${stats.totalDonations ? `
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #065f46;">
                🎉 You've helped save <strong>${stats.totalDonations} lives</strong> so far. Amazing work!
              </p>
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="https://medireach.com/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `
  })
};

// Cloud Function: Send welcome email on user registration
exports.sendWelcomeEmail = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    
    if (!userData.email) {
      console.log('No email found for user');
      return null;
    }

    const emailContent = templates.welcome(userData.name || 'User');

    const mailOptions = {
      from: '"MediReach" <no-reply@medireach.com>',
      to: userData.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', userData.email);
      return null;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return null;
    }
  });

// Cloud Function: Notify when request is verified
exports.sendRequestVerifiedEmail = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if status changed to 'Verified'
    if (before.status !== 'Verified' && after.status === 'Verified') {
      const userDoc = await admin.firestore().doc(`users/${after.receiverId}`).get();
      const userData = userDoc.data();

      if (!userData || !userData.email) return null;

      const emailContent = templates.requestVerified(
        userData.name,
        context.params.requestId,
        after.bloodGroup,
        after.urgency
      );

      const mailOptions = {
        from: '"MediReach" <no-reply@medireach.com>',
        to: userData.email,
        subject: emailContent.subject,
        html: emailContent.html
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Request verified email sent');
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }

    return null;
  });

// Cloud Function: Notify when donor accepts request
exports.sendDonorMatchedEmail = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if new donors were added to acceptedDonors
    const newDonors = (after.acceptedDonors || []).filter(
      donorId => !(before.acceptedDonors || []).includes(donorId)
    );

    if (newDonors.length === 0) return null;

    // Get receiver info
    const receiverDoc = await admin.firestore().doc(`users/${after.receiverId}`).get();
    const receiverData = receiverDoc.data();

    if (!receiverData || !receiverData.email) return null;

    // Get donor info
    const donorDoc = await admin.firestore().doc(`users/${newDonors[0]}`).get();
    const donorData = donorDoc.data();

    const emailContent = templates.donorMatched(
      receiverData.name,
      donorData.name || 'Anonymous Donor',
      donorData.phone || 'Not provided',
      context.params.requestId,
      after.bloodGroup
    );

    const mailOptions = {
      from: '"MediReach" <no-reply@medireach.com>',
      to: receiverData.email,
      subject: emailContent.subject,
      html: emailContent.html
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Donor matched email sent');
    } catch (error) {
      console.error('Error sending email:', error);
    }

    return null;
  });

// Cloud Function: Send urgent request notifications to nearby donors
exports.sendUrgentRequestEmails = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (snap, context) => {
    const requestData = snap.data();

    // Only send for urgent requests
    if (requestData.urgency !== 'Critical' && requestData.urgency !== 'High') {
      return null;
    }

    // Query nearby donors with matching blood group
    const donorsSnapshot = await admin.firestore()
      .collection('users')
      .where('role', '==', 'donor')
      .where('bloodGroup', '==', requestData.bloodGroup)
      .where('available', '==', true)
      .get();

    const emailPromises = [];

    donorsSnapshot.forEach(doc => {
      const donorData = doc.data();
      
      if (!donorData.email || !donorData.emailNotifications) return;

      const emailContent = templates.urgentRequest(
        donorData.name,
        requestData.bloodGroup,
        requestData.location,
        requestData.urgency,
        context.params.requestId
      );

      const mailOptions = {
        from: '"MediReach" <no-reply@medireach.com>',
        to: donorData.email,
        subject: emailContent.subject,
        html: emailContent.html
      };

      emailPromises.push(transporter.sendMail(mailOptions));
    });

    try {
      await Promise.all(emailPromises);
      console.log(`Sent ${emailPromises.length} urgent request emails`);
    } catch (error) {
      console.error('Error sending urgent emails:', error);
    }

    return null;
  });

// Scheduled Function: Send daily digest emails (Run daily at 9 AM)
exports.sendDailyDigest = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore()
      .collection('users')
      .where('emailDigest', '==', true)
      .get();

    const emailPromises = [];

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      if (!userData.email) continue;

      // Get user's stats
      let pendingRequests = 0;
      let nearbyRequests = 0;
      let totalDonations = 0;

      if (userData.role === 'receiver') {
        const requestsSnapshot = await admin.firestore()
          .collection('requests')
          .where('receiverId', '==', userDoc.id)
          .where('status', 'in', ['Pending', 'Verified', 'Matched'])
          .get();
        pendingRequests = requestsSnapshot.size;
      }

      if (userData.role === 'donor') {
        const nearbySnapshot = await admin.firestore()
          .collection('requests')
          .where('bloodGroup', '==', userData.bloodGroup)
          .where('status', '==', 'Verified')
          .limit(10)
          .get();
        nearbyRequests = nearbySnapshot.size;

        const donationsSnapshot = await admin.firestore()
          .collection('donations')
          .where('donorId', '==', userDoc.id)
          .get();
        totalDonations = donationsSnapshot.size;
      }

      const emailContent = templates.dailyDigest(
        userData.name,
        pendingRequests,
        nearbyRequests,
        { totalDonations }
      );

      const mailOptions = {
        from: '"MediReach" <no-reply@medireach.com>',
        to: userData.email,
        subject: emailContent.subject,
        html: emailContent.html
      };

      emailPromises.push(transporter.sendMail(mailOptions));
    }

    try {
      await Promise.all(emailPromises);
      console.log(`Sent ${emailPromises.length} daily digest emails`);
    } catch (error) {
      console.error('Error sending daily digests:', error);
    }

    return null;
  });

module.exports = exports;
