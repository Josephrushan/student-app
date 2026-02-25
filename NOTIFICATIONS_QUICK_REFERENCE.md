// Quick Reference: Push Notifications

// 1. ADD SUBSCRIBE BUTTON TO ANY COMPONENT
import { NotificationSubscribeButton } from './components/NotificationSubscribeButton';

export function MyComponent() {
  return (
    <div>
      <h1>Enable Notifications</h1>
      <NotificationSubscribeButton />
    </div>
  );
}

// 2. USE THE HOOK IN YOUR COMPONENT
import { useNotificationSubscription } from './hooks/useNotificationSubscription';

export function NotificationSettings() {
  const { isSubscribed, isLoading, subscribe, unsubscribe } = useNotificationSubscription();
  
  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isLoading}>
      {isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
    </button>
  );
}

// 3. CHECK SUBSCRIPTION STATUS ON APP START
import { useEffect } from 'react';
import { checkNotificationSubscription } from './services/notificationService';

useEffect(() => {
  const checkStatus = async () => {
    const subscription = await checkNotificationSubscription();
    if (subscription) {
      console.log('User is subscribed to notifications');
      // Send subscription to backend: POST /api/subscribe
    }
  };
  checkStatus();
}, []);

// 4. STORE SUBSCRIPTION ON BACKEND
export async function storeSubscription(userId: string, subscription: PushSubscription) {
  await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, subscription: subscription.toJSON() })
  });
}

// 5. SEND NOTIFICATION FROM BACKEND (Node.js with web-push)
const webpush = require('web-push');
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

app.post('/api/send-notification', async (req, res) => {
  const { userId, title, message, url } = req.body;
  
  const subscription = await getSubscriptionFromDB(userId);
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify({
      title: title,
      message: message,
      icon: '/icon.png',
      url: url
    }));
    res.json({ success: true });
  } catch (error) {
    console.error('Send notification failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. HANDLE NOTIFICATION CLICKS (Already in public/sw.js)
// When user clicks a notification, the URL specified in data.url will open

// 7. ENVIRONMENT VARIABLES NEEDED
// In .env.local (Already set):
// VAPID_PUBLIC_KEY=BPTWePkdbcMjZE3VkM5cv-LaD3LwNscJvSR0LKeD32eB3XErAwlwR8RyUufDcciA_gb58YTUx4mYLcFYt1A-7jE
// VAPID_PRIVATE_KEY=fSLnlHaJ3UlX3aeKwF9rlIHGr1xaZswcHTQvXT9a0qU

// 8. COMMON NOTIFICATIONS TO SEND
// New homework assignment
webpush.sendNotification(subscription, JSON.stringify({
  title: 'New Homework',
  message: 'Physics assignment due tomorrow',
  icon: '/icon.png',
  url: '/homework'
}));

// Alert for student
webpush.sendNotification(subscription, JSON.stringify({
  title: 'Student Alert',
  message: 'John has been marked absent',
  icon: '/icon.png',
  url: '/alerts'
}));

// Chat message
webpush.sendNotification(subscription, JSON.stringify({
  title: 'New Message',
  message: 'Teacher: Please submit your assignment',
  icon: '/icon.png',
  url: '/inbox'
}));

// Calendar event
webpush.sendNotification(subscription, JSON.stringify({
  title: 'Upcoming Event',
  message: 'Parent-teacher meeting in 1 hour',
  icon: '/icon.png',
  url: '/calendar'
}));

// 9. DEBUGGING IN BROWSER
// Open DevTools and run:
navigator.serviceWorker.ready.then(reg => {
  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub);
  });
});

// 10. TESTING SERVICE WORKER
// The sw.js file is registered in index.tsx
// Check DevTools > Application > Service Workers to see its status
// Check DevTools > Console for registration messages
