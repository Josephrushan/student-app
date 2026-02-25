// services/pushNotificationService.ts
// Service to send push notifications to users

import { getUserPushSubscriptions, removePushSubscription } from './firebaseService';

// Determine correct API endpoint based on environment
const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      // For localhost development, use local backend server
      return 'http://localhost:5000';
    }
  }
  
  // For production (Vercel), use Vercel base URL
  return 'https://app.educater.co.za';
};

const API_URL = getApiUrl();

/**
 * Send a push notification to a specific user
 * Call this whenever you want to notify a user (new message, homework, alert, etc)
 * Note: userId can be either a custom ID or Firebase UID
 */
export const sendPushNotificationToUser = async (
  recipientUserId: string,
  options: {
    title: string;
    message: string;
    icon?: string;
    url?: string;
  }
) => {
  try {
    console.log(`📤 [pushNotificationService] Sending notification:`);
    console.log(`   ✉️  TO: ${recipientUserId}`);
    console.log(`   📌 title: ${options.title}`);
    console.log(`   📝 message: ${options.message.substring(0, 50)}...`);
    
    // The userId passed might be a custom ID, but subscriptions are indexed by Firebase UID
    // Simply POST to backend with userId - backend will handle looking it up
    try {
      const body = {
        userId: recipientUserId,
        title: options.title,
        message: options.message,
        icon: options.icon || '/educater-icon-512.png',
        url: options.url || '/'
      };
      
      console.log(`   🔌 Calling ${API_URL}/api/send-push...`);
      
      const response = await fetch(`${API_URL}/api/send-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`❌ Failed to send push:`, errorData);
      } else {
        const result = await response.json();
        if (result.results?.sent > 0) {
          console.log(`✅ Push notification sent to ${result.results.sent} device(s)`);
        } else {
          console.log('⚠️ No active subscriptions for user');
        }
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  } catch (error) {
    console.error('❌ Error in sendPushNotificationToUser:', error);
  }
};

/**
 * Example usage in InboxModule or ChatModule:
 * 
 * When a user sends a message:
 * 
 * import { sendPushNotificationToUser } from '../services/pushNotificationService';
 * 
 * const handleSendMessage = async (recipientId: string, messageText: string) => {
 *   // Save message to database
 *   await saveDoc('messages', messageId, messageData);
 *   
 *   // Send push notification
 *   await sendPushNotificationToUser(recipientId, {
 *     title: `New message from ${senderName}`,
 *     message: messageText,
 *     icon: senderAvatar,
 *     url: '/inbox'
 *   });
 * };
 */
