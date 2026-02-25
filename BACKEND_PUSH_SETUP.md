# Push Notifications Backend Integration Guide

## Summary

You've now set up the complete frontend for push notifications. When users click "Enable Notifications" on their profile, their subscription is automatically saved to Firebase in the `pushSubscriptions` collection.

---

## What's Stored in Firebase

When a user enables notifications, this is saved:

```firestore
pushSubscriptions/
├── {userId}_1704960000000/
│   ├── userId: "user123"
│   ├── endpoint: "https://fcm.googleapis.com/fcm/send/..."
│   ├── keys: {
│   │   ├── p256dh: "base64-encoded-key"
│   │   └── auth: "base64-encoded-auth"
│   ├── createdAt: 2026-01-24
│   └── updatedAt: 2026-01-24
└── {userId}_1704960030000/
    └── ...
```

---

## Backend Setup Required

You need to create ONE API endpoint to receive and send push notifications.

### Node.js/Express Backend Example

```bash
npm install web-push express
```

```javascript
// backend/routes/push.js
const express = require('express');
const webpush = require('web-push');
const router = express.Router();

// Set your VAPID details (from .env.local)
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * POST /api/send-push
 * Sends a web push notification
 */
router.post('/api/send-push', async (req, res) => {
  try {
    const { subscription, payload } = req.body;

    if (!subscription || !payload) {
      return res.status(400).json({ error: 'Missing subscription or payload' });
    }

    // Send the push notification
    await webpush.sendNotification(subscription, JSON.stringify(payload));

    res.json({ success: true, message: 'Push sent' });
  } catch (error) {
    console.error('Push notification error:', error);
    
    if (error.statusCode === 410) {
      // Subscription has been unsubscribed or expired
      res.status(410).json({ error: 'Subscription expired' });
    } else {
      res.status(500).json({ error: 'Failed to send push notification' });
    }
  }
});

module.exports = router;
```

Then in your main app:

```javascript
// backend/server.js
const express = require('express');
const pushRoutes = require('./routes/push');

const app = express();
app.use(express.json());

app.use('/api', pushRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
```

---

## How to Send Notifications from Your App

Once the backend is set up, use the `sendPushNotificationToUser` function:

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

// Example: When a user sends a message
const handleSendMessage = async (recipientId: string, messageText: string) => {
  // 1. Save message to database
  const messageId = `msg_${Date.now()}`;
  await saveDoc('messages', messageId, {
    senderId: currentUser.id,
    senderName: currentUser.name,
    senderAvatar: currentUser.avatar,
    recipientId,
    text: messageText,
    timestamp: Date.now()
  });

  // 2. Send push notification to recipient
  await sendPushNotificationToUser(recipientId, {
    title: `New message from ${currentUser.name}`,
    message: messageText.substring(0, 50), // First 50 chars
    icon: currentUser.avatar,
    url: '/inbox'
  });

  setMessages([...messages, { id: messageId, ...messageData }]);
};
```

---

## Examples: When to Send Notifications

### New Message/Chat

```typescript
// In InboxModule.tsx or ChatModule.tsx
await sendPushNotificationToUser(recipientId, {
  title: `New message from ${senderName}`,
  message: messageText,
  icon: senderAvatar,
  url: '/inbox'
});
```

### New Homework Assignment

```typescript
// In HomeworkModule.tsx when teacher creates assignment
const myStudents = allUsers.filter(u => u.grade === assignment.grade);
for (const student of myStudents) {
  await sendPushNotificationToUser(student.id, {
    title: 'New Homework Assignment',
    message: assignment.title,
    icon: '/book-icon.png',
    url: '/homework'
  });
}
```

### Student Alert (for parents)

```typescript
// In AlertsModule.tsx when alert is created
const parentId = student.parentId;
await sendPushNotificationToUser(parentId, {
  title: 'Alert: ' + student.name,
  message: alert.description,
  icon: '/alert-icon.png',
  url: '/alerts'
});
```

### Announcement

```typescript
// In AnnouncementsModule.tsx when principal posts announcement
const staffMembers = allUsers.filter(u => 
  u.role === 'TEACHER' || u.role === 'PRINCIPAL'
);
for (const staff of staffMembers) {
  await sendPushNotificationToUser(staff.id, {
    title: 'New Announcement',
    message: announcement.content,
    icon: '/announcement-icon.png',
    url: '/announcements'
  });
}
```

### Calendar Event Reminder

```typescript
// In CalendarModule.tsx or a scheduled job
await sendPushNotificationToUser(userId, {
  title: 'Upcoming Event',
  message: event.title,
  icon: '/calendar-icon.png',
  url: '/calendar'
});
```

---

## Testing

### 1. Enable Notifications in App
- Go to Profile page
- Click "Enable Notifications"
- Grant permission
- Check browser console for ✅ "Push subscription saved to Firebase"

### 2. Verify in Firebase Console
- Go to firebaseapp.com
- Navigate to your project → Firestore → pushSubscriptions collection
- You should see your subscription with your userId

### 3. Send Test Notification
- Make a test request to your backend:

```bash
curl -X POST http://localhost:5000/api/send-push \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {
        "p256dh": "...",
        "auth": "..."
      }
    },
    "payload": {
      "title": "Test Notification",
      "message": "This is a test",
      "icon": "/icon.png",
      "url": "/inbox"
    }
  }'
```

4. **Minimize your app or go to another tab**
5. You should see the notification pop up!

---

## Troubleshooting

### ❌ "No push subscriptions found"
- User hasn't enabled notifications yet
- User denied permission
- Subscription expired (happens after ~60 days of no access)

### ❌ Push sent but no notification appears
- Ensure your backend `/api/send-push` endpoint is working
- Check backend logs for errors
- Verify VAPID keys are correct
- Make sure the app is minimized or in background (notifications don't show when app is in focus by default)

### ❌ 410 Subscription Expired
- This means the subscription is no longer valid
- Next time user opens the app and clicks enable again, a new subscription will be created
- You can clean up expired subscriptions from the database

---

## Checklist

- [ ] Backend `/api/send-push` endpoint created
- [ ] Node `web-push` library installed
- [ ] VAPID keys configured in backend
- [ ] Test notification sent successfully
- [ ] Notification appears when app is minimized
- [ ] Click notification opens correct URL
- [ ] Integrated with message sending
- [ ] Integrated with homework assignment creation
- [ ] Integrated with alert creation
- [ ] Integrated with announcements
- [ ] Integrated with calendar events

---

## Need Help?

Check the `pushNotificationService.ts` file for the `sendPushNotificationToUser` function and its usage examples.
