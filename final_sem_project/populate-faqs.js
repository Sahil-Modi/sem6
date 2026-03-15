// Script to populate default FAQs in Firestore
// Run this in Firebase Console or as a Cloud Function

const defaultFAQs = [
  // General FAQs
  {
    question: "What is MediReach?",
    answer: "MediReach is a blood donation platform that connects blood donors with people in need. We use AI-powered matching to find the best donors based on location, availability, and urgency.",
    category: "general",
    roles: ["all"],
    order: 1
  },
  {
    question: "How do I create an account?",
    answer: "Click on 'Register' in the top navigation, choose your role (Donor, Receiver, NGO, or Hospital), fill in your details, and submit. You'll receive a verification email to activate your account.",
    category: "general",
    roles: ["all"],
    order: 2
  },
  {
    question: "Is MediReach free to use?",
    answer: "Yes! MediReach is completely free for all users. Our mission is to save lives by connecting donors with those in need at no cost.",
    category: "general",
    roles: ["all"],
    order: 3
  },

  // Donor FAQs
  {
    question: "Who can donate blood?",
    answer: "You can donate blood if you:\n• Are 18-65 years old\n• Weigh at least 50 kg\n• Are in good health\n• Haven't donated in the last 3 months\n\nConsult with a medical professional if you have specific health concerns.",
    category: "donation",
    roles: ["donor", "all"],
    order: 4
  },
  {
    question: "How often can I donate blood?",
    answer: "You can safely donate whole blood every 3 months (90 days). For platelet donation, you can donate every 7 days, up to 24 times per year.",
    category: "donation",
    roles: ["donor", "all"],
    order: 5
  },
  {
    question: "How do I update my availability status?",
    answer: "Go to your Dashboard, find the 'Availability' toggle switch, and turn it ON when you're ready to donate or OFF when unavailable. This helps us match you with urgent requests.",
    category: "donation",
    roles: ["donor"],
    order: 6
  },
  {
    question: "What should I do before donating blood?",
    answer: "Before donation:\n• Get a good night's sleep (7-8 hours)\n• Eat a healthy meal 2-3 hours before\n• Drink plenty of water\n• Avoid alcohol for 24 hours\n• Bring a valid ID\n• Wear comfortable clothing",
    category: "donation",
    roles: ["donor", "all"],
    order: 7
  },
  {
    question: "Will I be notified of urgent requests?",
    answer: "Yes! If you've enabled notifications and are marked as available, you'll receive alerts for urgent blood requests near your location. You can customize notification settings in your profile.",
    category: "donation",
    roles: ["donor"],
    order: 8
  },

  // Receiver FAQs
  {
    question: "How do I request blood?",
    answer: "1. Click 'Create Request' in your dashboard\n2. Select blood group and quantity needed\n3. Choose urgency level\n4. Add location and description\n5. Submit for verification\n\nVerified organizations (NGOs/Hospitals) can approve your request within hours.",
    category: "requests",
    roles: ["receiver", "all"],
    order: 9
  },
  {
    question: "How long does verification take?",
    answer: "Requests are typically verified within 2-6 hours during business hours. Critical/Emergency requests are prioritized and verified within 30-60 minutes.",
    category: "verification",
    roles: ["receiver", "ngo", "hospital"],
    order: 10
  },
  {
    question: "Can I edit my request after submission?",
    answer: "Yes! You can edit your request before it's matched with donors. Go to 'My Requests', select your request, and click 'Edit Request'. Once donors have accepted, editing is restricted.",
    category: "requests",
    roles: ["receiver"],
    order: 11
  },
  {
    question: "What happens after my request is verified?",
    answer: "Once verified, our AI system matches your request with the best available donors based on:\n• Distance from your location\n• Blood group compatibility\n• Donor availability\n• Past donation history\n\nMatched donors will be notified, and you can contact them directly via chat.",
    category: "requests",
    roles: ["receiver"],
    order: 12
  },
  {
    question: "How do I contact donors who accepted my request?",
    answer: "Go to your request details page. Under 'Accepted Donors', you'll see 'Message Donor' buttons. Click to start a conversation and coordinate pickup details.",
    category: "requests",
    roles: ["receiver"],
    order: 13
  },

  // NGO/Hospital FAQs
  {
    question: "How do we get verified as an organization?",
    answer: "During registration:\n1. Select 'NGO' or 'Hospital' as your role\n2. Upload verification documents (registration certificate, license)\n3. Provide organization details\n\nAdmin will review and verify within 24-48 hours. You'll receive email confirmation.",
    category: "verification",
    roles: ["ngo", "hospital"],
    order: 14
  },
  {
    question: "Can we verify blood requests on behalf of patients?",
    answer: "Yes! Verified NGOs and Hospitals can:\n• Review pending requests\n• Verify legitimate requests\n• Reject fraudulent requests\n• Add verification notes\n\nGo to 'Verify Requests' in your dashboard.",
    category: "verification",
    roles: ["ngo", "hospital"],
    order: 15
  },
  {
    question: "How do we organize blood donation camps?",
    answer: "Blood donation camp feature is coming soon! You'll be able to:\n• Create camp events\n• Set location and date\n• Invite registered donors\n• Track registrations\n• Generate reports",
    category: "general",
    roles: ["ngo", "hospital"],
    order: 16
  },

  // Safety FAQs
  {
    question: "Is my personal information safe?",
    answer: "Absolutely! We take privacy seriously:\n• All data is encrypted\n• Secure Firebase authentication\n• GDPR compliant\n• No data sharing with third parties\n• You control what information is visible\n\nRead our Privacy Policy for details.",
    category: "safety",
    roles: ["all"],
    order: 17
  },
  {
    question: "How do I verify if a request is legitimate?",
    answer: "Look for:\n✓ Verified badge on requests\n✓ Organization/Hospital verification\n✓ Detailed description\n✓ Valid contact information\n\n⚠️ Red flags:\n✗ Vague descriptions\n✗ Unverified status\n✗ Suspicious contact details\n\nReport suspicious requests to admin.",
    category: "safety",
    roles: ["donor", "all"],
    order: 18
  },
  {
    question: "What if I face harassment or abuse?",
    answer: "We have zero tolerance for harassment:\n1. Report the user immediately via their profile\n2. Block them from contacting you\n3. Contact our support team at support@medireach.com\n4. We'll investigate within 24 hours\n\nYour safety is our priority.",
    category: "safety",
    roles: ["all"],
    order: 19
  },

  // Technical FAQs
  {
    question: "I'm not receiving notifications. What should I do?",
    answer: "Troubleshooting steps:\n1. Check notification settings in your profile\n2. Ensure browser notifications are enabled\n3. Check spam/junk folder for emails\n4. Update your email address if needed\n5. Try logging out and back in\n\nStill not working? Contact support.",
    category: "technical",
    roles: ["all"],
    order: 20
  },
  {
    question: "The app is slow or not loading. Help!",
    answer: "Try these fixes:\n1. Refresh the page (Ctrl+F5)\n2. Clear browser cache and cookies\n3. Try a different browser (Chrome recommended)\n4. Check your internet connection\n5. Disable browser extensions temporarily\n\nIf issues persist, contact technical support.",
    category: "technical",
    roles: ["all"],
    order: 21
  },
  {
    question: "How do I change my password?",
    answer: "Password reset:\n1. Click 'Forgot Password' on login page\n2. Enter your registered email\n3. Check email for reset link\n4. Follow link and create new password\n\nFor security, use a strong password with letters, numbers, and symbols.",
    category: "technical",
    roles: ["all"],
    order: 22
  },

  // Advanced FAQs
  {
    question: "How does the AI matching system work?",
    answer: "Our AI considers multiple factors:\n\n📍 Distance (50% weight): Closer donors ranked higher\n⏰ Availability (25% weight): Active donors prioritized\n⭐ Reliability (15% weight): Based on donation history\n🚨 Urgency (10% weight): Matches urgent requests with responsive donors\n\nThe system calculates a match score and recommends top donors.",
    category: "technical",
    roles: ["donor", "receiver", "ngo", "hospital"],
    order: 23
  },
  {
    question: "Can I download my donation history?",
    answer: "Yes! Go to 'Donation History' in your dashboard and click 'Export to PDF' or 'Download CSV'. This includes:\n• All past donations\n• Dates and locations\n• Recipients (if consented)\n• Certificates\n\nGreat for maintaining personal records!",
    category: "general",
    roles: ["donor"],
    order: 24
  },
  {
    question: "How do I delete my account?",
    answer: "To delete your account:\n1. Go to Profile Settings\n2. Scroll to 'Danger Zone'\n3. Click 'Delete Account'\n4. Confirm your decision\n\n⚠️ Warning: This action is irreversible. All data will be permanently deleted.",
    category: "general",
    roles: ["all"],
    order: 25
  },

  // Additional Donor FAQs
  {
    question: "What happens to my blood after donation?",
    answer: "After donation, your blood goes through:\n1. Testing for blood type and infectious diseases\n2. Separation into components (red cells, platelets, plasma)\n3. Storage in controlled temperature facilities\n4. Distribution to hospitals and patients in need\n\nOne donation can save up to 3 lives!",
    category: "donation",
    roles: ["donor", "all"],
    order: 26
  },
  {
    question: "Can I specify who receives my blood donation?",
    answer: "Yes! If you're donating for a specific person:\n• Click on their request\n• Select 'Donate for this request'\n• Coordinate directly with them\n\nYou can also choose to donate to blood banks for general use.",
    category: "donation",
    roles: ["donor"],
    order: 27
  },
  {
    question: "Are there any side effects of blood donation?",
    answer: "Most donors experience no side effects. Some may feel:\n• Mild dizziness (rest for 10-15 minutes)\n• Slight bruising at needle site\n• Fatigue (eat well and hydrate)\n\nSerious reactions are extremely rare. Medical staff are trained to handle any issues.",
    category: "donation",
    roles: ["donor", "all"],
    order: 28
  },
  {
    question: "Do I get a certificate after donating blood?",
    answer: "Yes! After each verified donation:\n• Digital certificate in your dashboard\n• Downloadable PDF with donation details\n• Shareable on social media\n• Counts towards donation badges and achievements\n\nCertificates include date, location, and blood group donated.",
    category: "donation",
    roles: ["donor"],
    order: 29
  },
  {
    question: "Can I track the impact of my donations?",
    answer: "Absolutely! Your dashboard shows:\n📊 Total donations made\n👥 Lives potentially saved\n🏆 Achievement badges earned\n📍 Donation locations map\n⏱️ Donation timeline\n💬 Thank you messages from recipients (if they choose to share)\n\nWatch your life-saving impact grow!",
    category: "donation",
    roles: ["donor"],
    order: 30
  },

  // Additional Receiver FAQs
  {
    question: "What blood groups can I receive?",
    answer: "Blood compatibility chart:\n• O- can receive: O-\n• O+ can receive: O-, O+\n• A- can receive: O-, A-\n• A+ can receive: O-, O+, A-, A+\n• B- can receive: O-, B-\n• B+ can receive: O-, O+, B-, B+\n• AB- can receive: O-, A-, B-, AB-\n• AB+ can receive: All blood groups (universal recipient)\n\nOur system automatically matches compatible donors.",
    category: "requests",
    roles: ["receiver", "all"],
    order: 31
  },
  {
    question: "Can I request blood for a family member?",
    answer: "Yes! When creating a request:\n1. Select 'Requesting for family member'\n2. Provide patient name and relationship\n3. Upload medical documentation (if available)\n4. Add hospital/contact details\n\nEnsure you have authorization to request on their behalf.",
    category: "requests",
    roles: ["receiver"],
    order: 32
  },
  {
    question: "What if no donors respond to my request?",
    answer: "If you don't get responses:\n1. Check urgency level - upgrade to 'Critical' if needed\n2. Expand search radius in settings\n3. Share request link on social media\n4. Contact nearby NGOs/hospitals directly\n5. Use 'Boost Request' feature (highlights your request)\n\nOur support team can also help amplify urgent requests.",
    category: "requests",
    roles: ["receiver"],
    order: 33
  },
  {
    question: "Is there a limit to how many requests I can create?",
    answer: "No hard limit, but:\n• Only 1 active request per blood group at a time\n• Previous requests must be marked 'Fulfilled' or 'Cancelled'\n• Frequently cancelled requests may require additional verification\n• Emergency requests have priority\n\nWe monitor for misuse to protect donors.",
    category: "requests",
    roles: ["receiver"],
    order: 34
  },
  {
    question: "How do I mark my request as fulfilled?",
    answer: "Once you've received the blood:\n1. Go to 'My Requests'\n2. Click on the fulfilled request\n3. Select 'Mark as Fulfilled'\n4. Optionally rate and thank donors\n5. Submit completion form\n\nThis helps maintain accurate data and donor motivation!",
    category: "requests",
    roles: ["receiver"],
    order: 35
  },

  // Additional NGO/Hospital FAQs
  {
    question: "Can we access analytics on blood requests in our area?",
    answer: "Yes! Verified organizations get access to:\n📈 Regional request trends\n🩸 Blood group demand patterns\n📊 Fulfillment rates\n🗺️ Geographic heatmaps\n📅 Seasonal variation data\n\nGo to 'Analytics Dashboard' to view detailed reports.",
    category: "general",
    roles: ["ngo", "hospital"],
    order: 36
  },
  {
    question: "How do we manage multiple staff accounts?",
    answer: "Organization admins can:\n• Invite team members via email\n• Assign roles (Verifier, Admin, Viewer)\n• Set permissions for each role\n• Monitor team activity logs\n• Revoke access when needed\n\nGo to 'Team Management' in settings.",
    category: "general",
    roles: ["ngo", "hospital"],
    order: 37
  },
  {
    question: "Can we integrate MediReach with our hospital management system?",
    answer: "API integration is coming soon! Features will include:\n• Real-time blood inventory sync\n• Automated request creation\n• Donor database integration\n• Custom reporting\n\nContact our enterprise team at enterprise@medireach.com for early access.",
    category: "technical",
    roles: ["hospital", "ngo"],
    order: 38
  },

  // Additional Safety FAQs
  {
    question: "How is blood screened for safety?",
    answer: "All donated blood undergoes mandatory testing for:\n✓ HIV/AIDS\n✓ Hepatitis B and C\n✓ Syphilis\n✓ Malaria (in endemic areas)\n✓ Blood typing and Rh factor\n\nOnly blood that passes all tests is used. Your safety is paramount!",
    category: "safety",
    roles: ["receiver", "all"],
    order: 39
  },
  {
    question: "What if I accidentally shared sensitive information in chat?",
    answer: "You can:\n1. Delete your message (click message → Delete)\n2. Report the conversation to admin\n3. Request data removal from support@medireach.com\n\n⚠️ Never share:\n• Bank/payment details\n• Government ID numbers\n• Passwords\n• Excessive medical records\n\nDonors should never ask for payment!",
    category: "safety",
    roles: ["all"],
    order: 40
  },
  {
    question: "Does MediReach verify all donors?",
    answer: "Yes! All donors undergo:\n✓ Email verification\n✓ Phone number verification\n✓ Profile review by admins\n✓ First donation verification by hospitals/NGOs\n\n🏅 'Verified Donor' badge appears after first successful donation.\n⭐ 'Trusted Donor' badge after 3+ verified donations.",
    category: "safety",
    roles: ["receiver", "all"],
    order: 41
  },

  // Additional Technical FAQs
  {
    question: "Which browsers are supported?",
    answer: "MediReach works best on:\n✅ Chrome 90+ (Recommended)\n✅ Firefox 88+\n✅ Safari 14+\n✅ Edge 90+\n\nMobile browsers:\n✅ Chrome Mobile\n✅ Safari iOS\n\nOlder browsers may have limited functionality.",
    category: "technical",
    roles: ["all"],
    order: 42
  },
  {
    question: "Can I use MediReach on my mobile phone?",
    answer: "Yes! MediReach is fully responsive:\n📱 Works on all mobile browsers\n📲 Add to home screen for app-like experience\n🔔 Push notifications on mobile\n\nNative mobile apps (iOS/Android) coming soon!",
    category: "technical",
    roles: ["all"],
    order: 43
  },
  {
    question: "How do I enable location services?",
    answer: "For accurate donor matching:\n\nOn Desktop:\n1. Click lock icon in address bar\n2. Select 'Site Settings'\n3. Enable Location\n4. Refresh page\n\nOn Mobile:\n1. Go to browser settings\n2. Find MediReach\n3. Allow Location access\n4. Refresh app\n\nWe only use location to find nearby donors - never tracked!",
    category: "technical",
    roles: ["all"],
    order: 44
  },
  {
    question: "What should I do if I find a bug?",
    answer: "Help us improve! Report bugs:\n1. Go to Profile → Help & Support\n2. Click 'Report a Bug'\n3. Describe the issue with:\n   • What you were doing\n   • What went wrong\n   • Screenshots (if possible)\n   • Browser/device info\n\nWe investigate all reports within 48 hours. Critical bugs are fixed ASAP!",
    category: "technical",
    roles: ["all"],
    order: 45
  }
];

// Function to add FAQs to Firestore
async function populateFAQs() {
  const db = firebase.firestore();
  
  for (const faq of defaultFAQs) {
    try {
      await db.collection('faqs').add({
        ...faq,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        links: []
      });
      console.log(`Added: ${faq.question}`);
    } catch (error) {
      console.error(`Error adding FAQ: ${error}`);
    }
  }
  
  console.log('✅ All FAQs added successfully!');
}

// Run the function
populateFAQs();
