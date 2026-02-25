// backend/routes/push.js
import express from 'express';
import cors from 'cors';
import webpush from 'web-push';
import admin from 'firebase-admin';

const router = express.Router();

// Apply CORS to this router
const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
};

router.use(cors(corsOptions));

// Handle preflight requests for all routes
router.options('*', cors(corsOptions));

// Firebase Admin is initialized in server.js
// This function gets the Firestore instance
const getFirestoreDB = () => {
  return admin.firestore();
};

/**
 * POST /api/send-push
 * Sends a web push notification to a user by their ID
 * 
 * Expected request body:
 * {
 *   "userId": "user-id-to-notify",
 *   "title": "Notification Title",
 *   "message": "Notification Message",
 *   "icon": "/icon.png",
 *   "url": "/path/to/open"
 * }
 * 
 * The backend will:
 * 1. Look up the user's push subscriptions in Firestore
 * 2. Send the notification to all their subscriptions
 */
router.post('/send-push', async (req, res) => {
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

    // Get user's push subscriptions from Firestore
    const db = getFirestoreDB();
    const querySnapshot = await db
      .collection('pushSubscriptions')
      .where('userId', '==', userId)
      .get();
    
    const subscriptions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        endpoint: data.endpoint,
        keys: data.keys
      };
    });

    console.log(`📬 Found ${subscriptions.length} subscription(s) for user`);

    if (subscriptions.length === 0) {
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

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, pushPayload);
        results.sent++;
        console.log('✅ Notification sent to subscription');
      } catch (error) {
        if (error.statusCode === 410) {
          results.expired++;
          console.warn('⚠️ Subscription expired');
        } else {
          results.failed++;
          console.error('Failed to send:', error.message);
        }
      }
    }

    console.log(`📊 Results: ${results.sent} sent, ${results.failed} failed, ${results.expired} expired`);

    res.json({ 
      success: results.sent > 0,
      message: 'Push notification processing complete',
      results
    });

  } catch (error) {
    console.error('❌ Push notification error:', error);
    res.status(500).json({ 
      error: 'Failed to send push notification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/send-push-to-multiple
 * Sends push notifications to multiple subscriptions
 * Useful for broadcasting to all users or specific groups
 */
router.post('/send-push-to-multiple', async (req, res) => {
  try {
    const { subscriptions, payload } = req.body;

    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid subscriptions',
        details: 'Must provide array of subscriptions'
      });
    }

    if (!payload) {
      return res.status(400).json({ 
        error: 'Missing payload'
      });
    }

    console.log(`📤 Sending broadcast notification to ${subscriptions.length} user(s)...`);

    const results = {
      sent: 0,
      failed: 0,
      expired: 0
    };

    const pushPayload = JSON.stringify({
      title: payload.title || 'Notification',
      body: payload.message || '',
      icon: payload.icon || '/icon.png',
      badge: '/icon.png',
      data: {
        url: payload.url || '/'
      }
    });

    // Send to each subscription
    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(subscription, pushPayload);
        results.sent++;
      } catch (error) {
        if (error.statusCode === 410) {
          results.expired++;
        } else {
          results.failed++;
          console.error('Failed to send to one subscription:', error.message);
        }
      }
    }

    console.log(`✅ Broadcast complete: ${results.sent} sent, ${results.failed} failed, ${results.expired} expired`);

    res.json({ 
      success: true, 
      message: 'Broadcast notification sent',
      results
    });

  } catch (error) {
    console.error('❌ Broadcast error:', error);
    res.status(500).json({ 
      error: 'Failed to send broadcast',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/test-push
 * Test endpoint - sends a test notification
 * Only available in development mode
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test-push', async (req, res) => {
    try {
      const { subscription } = req.body;

      if (!subscription) {
        return res.status(400).json({ 
          error: 'Missing subscription for test' 
        });
      }

      console.log('🧪 Sending test push notification...');

      await webpush.sendNotification(
        subscription,
        JSON.stringify({
          title: '🧪 Test Notification',
          body: 'If you see this, push notifications are working!',
          icon: '/icon.png',
          badge: '/icon.png',
          data: {
            url: '/'
          }
        })
      );

      console.log('✅ Test notification sent');

      res.json({ 
        success: true, 
        message: 'Test notification sent - check your browser!'
      });

    } catch (error) {
      console.error('❌ Test notification error:', error);
      res.status(500).json({ 
        error: 'Failed to send test notification',
        details: error.message
      });
    }
  });
}

export default router;
