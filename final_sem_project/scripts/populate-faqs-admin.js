const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const defaultFAQs = [
  {
    question: "What is MediReach?",
    answer: "MediReach is an AI-powered blood donation platform that connects donors with people in need. We use smart matching algorithms to find the best donors based on location, availability, and urgency.",
    category: "general",
    roles: ["all"],
    order: 1,
    links: []
  },
  {
    question: "Who can donate blood?",
    answer: "You can donate blood if you:\n• Are 18-65 years old\n• Weigh at least 50 kg\n• Are in good health\n• Haven't donated in the last 3 months\n\nConsult with a medical professional if you have specific health concerns.",
    category: "donation",
    roles: ["donor", "all"],
    order: 2,
    links: []
  },
  {
    question: "How do I create a blood request?",
    answer: "1. Click 'Create Request' in your dashboard\n2. Select blood group and quantity needed\n3. Choose urgency level\n4. Add location and description\n5. Submit for verification\n\nVerified organizations will approve your request within hours.",
    category: "requests",
    roles: ["receiver", "all"],
    order: 3,
    links: []
  },
  {
    question: "How does the AI matching work?",
    answer: "Our AI considers multiple factors:\n\n📍 Distance (50%): Closer donors ranked higher\n⏰ Availability (25%): Active donors prioritized\n⭐ Reliability (15%): Based on donation history\n🚨 Urgency (10%): Matches urgent requests with responsive donors\n\nThe system calculates a match score and recommends top donors.",
    category: "technical",
    roles: ["all"],
    order: 4,
    links: []
  },
  {
    question: "Is my personal information safe?",
    answer: "Absolutely! We take privacy seriously:\n• All data is encrypted\n• Secure Firebase authentication\n• GDPR compliant\n• No data sharing with third parties\n• You control what information is visible\n\nRead our Privacy Policy for details.",
    category: "safety",
    roles: ["all"],
    order: 5,
    links: []
  }
];

async function populateFAQs() {
  console.log('🚀 Starting FAQ population...\n');
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const faq of defaultFAQs) {
      try {
        await db.collection('faqs').add({
          ...faq,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Added: ${faq.question}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error adding FAQ: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n✨ FAQ population complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

populateFAQs();
