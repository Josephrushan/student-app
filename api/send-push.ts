import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import webpush from 'web-push';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const firebaseAdminConfig = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig as any),
  });
}

// Configure web push with VAPID keys
webpush.setVapidDetails(
  'mailto:info@visualmotion.co.za',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://app.educater.co.za',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Accept',
  'Access-Control-Allow-Credentials': 'true',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    res.end();
    return;
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, title, message, icon, url } = req.body;

    // Validation
    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId',
        details: 'Request must include userId to notify'
      });
    }

    if (!title || !message) {
      return res.status(400).json({
        error: 'Missing notification content',
        details: 'Request must include title and message'
      });
    }

    console.log(`📤 Sending notification to user: ${userId}`);
    console.log(`   Title: ${title}`);
    console.log(`   Message: ${message}`);

    // CHECK USER PAYMENT STATUS: Verify parents/students are still paid before sending notification
    // Teachers and Principals (staff) don't require payment, so skip check for them
    const db = admin.firestore();
    
    // Try to get user - userId might be custom ID or Firebase UID
    let userDoc = await db.collection('users').doc(userId).get();
    let firebaseUid = userId;
    
    if (!userDoc.exists) {
      // Document not found with userId as document ID
      // Try searching by custom 'id' field instead
      console.log(`⏳ User document not found as ${userId}, searching by custom id field...`);
      const snapshot = await db.collection('users').where('id', '==', userId).limit(1).get();
      
      if (snapshot.empty) {
        console.warn(`⚠️ User not found with ID: ${userId}`);
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      userDoc = snapshot.docs[0];
      firebaseUid = userDoc.id; // The document ID is the Firebase UID
      console.log(`✅ Found user - Firebase UID: ${firebaseUid}`);
    } else {
      // Document found - the userId is the Firebase UID
      firebaseUid = userId;
    }
    
    const userData = userDoc.data();
    
    // Only check isPaid for Parents and Students (not Teachers/Principals)
    const isStaff = userData?.role === 'Teacher' || userData?.role === 'Principal';
    const isParentOrStudent = userData?.role === 'Parent' || userData?.role === 'Student';
    
    // Reject notification if parent/student's subscription is cancelled
    if (isParentOrStudent && userData?.isPaid === false) {
      console.warn(`🚫 User ${userId} (${userData?.role}) has cancelled subscription - notification blocked`);
      return res.status(403).json({
        success: false,
        message: 'User subscription is inactive',
        details: 'Notification not sent - user has cancelled their subscription'
      });
    }

    // Query subscriptions by Firebase UID
    console.log(`🔍 Looking for subscriptions with Firebase UID: ${firebaseUid}`);
    const querySnapshot = await db
      .collection('pushSubscriptions')
      .where('userId', '==', firebaseUid)
      .get();

    const subscriptions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        endpoint: data.endpoint,
        keys: data.keys
      };
    });

    console.log(`📬 Found ${subscriptions.length} subscription(s) for user ${userId}`);

    if (subscriptions.length === 0) {
      console.warn(`⚠️ No active subscriptions for user ${userId}`);
      return res.status(200).json({
        success: false,
        message: 'No subscriptions found for user'
      });
    }

    // Send notification to all subscriptions
    const pushPayload = JSON.stringify({
      title: title,
      body: message,
      icon: icon || '/educater-icon-192.png',
      badge: icon || '/educater-icon-192.png',
      tag: 'notification',
      data: {
        url: url || '/'
      }
    });

    const results = {
      sent: 0,
      failed: 0,
      expired: 0
    };

    const subscriptionDocsToDelete: string[] = [];

    for (const docSnapshot of querySnapshot.docs) {
      const subscription = {
        endpoint: docSnapshot.data().endpoint,
        keys: docSnapshot.data().keys
      };

      try {
        await webpush.sendNotification(subscription, pushPayload);
        results.sent++;
        console.log('✅ Notification sent to subscription');
      } catch (error: any) {
        console.log(`📋 Error statusCode: ${error.statusCode}, Message: ${error.message}`);
        
        if (error.statusCode === 410) {
          results.expired++;
          console.warn('⚠️ Subscription expired (410) - will be deleted');
          subscriptionDocsToDelete.push(docSnapshot.id);
        } else if (error.statusCode === 400 || error.message.includes('Received unexpected response code')) {
          // 400 Bad Request or other errors usually mean invalid subscription
          results.failed++;
          console.error(`❌ Invalid subscription (${error.statusCode}) - will be deleted:`, error.message);
          subscriptionDocsToDelete.push(docSnapshot.id);
        } else {
          results.failed++;
          console.error(`⚠️ Failed to send (${error.statusCode}):`, error.message);
          // Don't delete on other errors - might be transient
        }
      }
    }

    // Delete expired/invalid subscriptions
    if (subscriptionDocsToDelete.length > 0) {
      console.log(`🗑️ Deleting ${subscriptionDocsToDelete.length} expired/invalid subscriptions...`);
      const batch = db.batch();
      for (const docId of subscriptionDocsToDelete) {
        batch.delete(db.collection('pushSubscriptions').doc(docId));
      }
      await batch.commit();
      console.log(`✅ Deleted ${subscriptionDocsToDelete.length} subscriptions`);
    }

    console.log(`📊 Results: ${results.sent} sent, ${results.failed} failed, ${results.expired} expired`);

    res.status(200).json({
      success: results.sent > 0,
      message: 'Push notification processing complete',
      results
    });

  } catch (error: any) {
    console.error('❌ Push notification error:', error);
    res.status(500).json({
      error: 'Failed to send push notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
