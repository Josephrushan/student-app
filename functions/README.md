# Firebase Cloud Function - Huawei Push Kit Integration

Complete setup for sending push notifications to Huawei Quick Apps via Firebase Cloud Functions.

## 📋 What's Included

- **TypeScript Cloud Functions** with Huawei Push Kit integration
- **OAuth2 Authentication** with Huawei servers
- **Firestore Trigger** on new notifications
- **Quick App Support** with `fast_app_target: 1`
- **Error Handling** and status tracking
- **Batch Broadcasting** function
- **Test HTTP endpoint** for validation

## 🚀 Setup Instructions

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Install Dependencies

```bash
cd functions
npm install
```

### 3. Build & Deploy

```bash
npm run build
firebase deploy --only functions
```

That's it! Your Huawei credentials are already embedded in the Cloud Function code:
- **Client ID**: 1877714599654983488
- **Client Secret**: F456383B87DC6B7A3064A793ADB9E9BDB6903C3F2DE0B1FB63D91736E9F3C459
- **App ID**: 116819743

## 📚 How It Works

### Trigger Flow

```
1. New document created in 'notifications' collection
   ↓
2. Cloud Function triggered
   ↓
3. Get Huawei OAuth2 access token
   ↓
4. Fetch user's Huawei regId from 'users' collection
   ↓
5. Send push to Huawei Push Kit API with fast_app_target: 1
   ↓
6. Update notification document with status
```

### Expected Firestore Collections

#### `users` Collection
```json
{
  "id": "user-123",
  "name": "John Doe",
  "huawei_token": "AEn...", // The regId from Huawei Push Kit
  "email": "john@example.com",
  ...
}
```

#### `notifications` Collection
```json
{
  "id": "notif-456",
  "userId": "user-123",
  "title": "New Homework",
  "body": "Physics assignment due tomorrow",
  "icon": "/homework-icon.png",
  "url": "/homework",
  "timestamp": 1707000000000,
  "status": "sent",
  "sentAt": 1707000001000
}
```

## 🔧 Functions Provided

### 1. `sendHuaweiPushOnNotification()` - Firestore Trigger

**Automatically triggered** when a document is created in `notifications` collection.

**Example - From your app:**
```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase'; // Your Firebase config

const sendNotificationViaCloudFunction = async (userId: string, message: string) => {
  await addDoc(collection(db, 'notifications'), {
    userId: userId,
    title: 'New Assignment',
    body: message,
    icon: '/educater-icon-192.png',
    url: '/homework',
    timestamp: serverTimestamp()
  });
  // Cloud Function automatically sends to Huawei!
};
```

### 2. `sendBroadcastNotification()` - Callable Function

Send to multiple users at once.

**From your app (client-side):**
```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const broadcastFn = httpsCallable(functions, 'sendBroadcastNotification');

// Send to all users
const result = await broadcastFn({
  title: 'System Update',
  body: 'New features available!',
  icon: '/icon.png',
  url: '/',
  userIds: [] // Leave empty for all users, or specify array of user IDs
});

console.log('Sent to', result.data.sent, 'users');
```

### 3. `testHuaweiPush()` - HTTP Endpoint

Test push delivery.

```bash
curl -X POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/testHuaweiPush \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "title": "Test",
    "body": "Test message"
  }'
```

## 📤 Deployment

### Local Testing (Emulator)

```bash
firebase emulators:start
```

Then from another terminal:
```bash
# Add a test notification
firebase firestore:delete notifications/test-doc
firebase firestore:set notifications/test-doc '{
  "userId": "test-user",
  "title": "Test",
  "body": "This is a test"
}'
```

### Deploy to Production

```bash
cd functions
npm run build
firebase deploy --only functions
```

Or just:
```bash
firebase deploy --only functions:sendHuaweiPushOnNotification,functions:sendBroadcastNotification,functions:testHuaweiPush
```

## 🔐 Security Rules

Add to your Firestore security rules:

```javascript
// Allow authenticated users to create notifications for themselves
match /notifications/{document=**} {
  allow create: if request.auth != null;
  allow read: if request.auth.uid == resource.data.userId;
  allow update, delete: if false; // Cloud Function updates
}

// Users can only read their own document
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if false;
}
```

## 🛠️ Troubleshooting

### "No Huawei token found for user"
- Ensure user registered their device with Huawei Push Kit
- Check that `huawei_token` field is stored in `users` collection
- Verify the token is not expired

### "Huawei authentication failed"
- Verify `HUAWEI_CLIENT_ID` and `HUAWEI_CLIENT_SECRET`
- Check they match your Huawei Developer Console credentials
- Ensure your app is verified in Huawei AppGallery Connect

### "fast_app_target: 1 not recognized"
- This parameter is required for Quick App delivery
- It's automatically included in the payload
- If Quick App still doesn't receive, check Huawei Push Kit logs

### Function timeouts
- Huawei API responses can be slow
- Increase timeout in `firebase.json`:
  ```json
  "functions": {
    "timeoutSeconds": 60
  }
  ```

## 📊 Monitoring

View logs in Firebase Console:

```bash
firebase functions:log
```

Or filter by function:
```bash
firebase functions:log --filter 'sendHuaweiPushOnNotification'
```

## 🔄 Status Tracking

After sending, notifications document includes:
- `status`: "sent", "failed", or "skipped"
- `sentAt` / `failedAt`: Timestamp
- `error`: Error message if failed
- `huaweiResponse`: Response from Huawei API

## 📝 Example Integration in Your App

**components/NotificationsModule.tsx:**
```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseService';

export const sendAdminNotification = async (
  userId: string,
  title: string,
  body: string
) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      body,
      icon: '/educater-icon-192.png',
      url: '/dashboard',
      timestamp: serverTimestamp()
    });
    
    console.log('✅ Notification queued for sending via Cloud Function');
  } catch (error) {
    console.error('Failed to queue notification:', error);
  }
};
```

## 🎯 Quick Reference

| Action | Code |
|--------|------|
| Send to user | Create doc in `notifications` |
| Send to multiple | Call `sendBroadcastNotification()` |
| Test delivery | Call `testHuaweiPush()` |
| View status | Check `notifications` doc |
| Debug | Use `firebase functions:log` |

## ✅ Deployment Checklist

- [ ] Set Huawei credentials in Firebase config
- [ ] Verify `users` collection has `huawei_token` field
- [ ] Test locally with Firebase emulator
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Create test notification document
- [ ] Verify notification appears on Huawei device
- [ ] Check Cloud Function logs
- [ ] Monitor error rates

## 📞 Support

For Huawei Push Kit API issues: https://developer.huawei.com/consumer/en/doc/HMSCore-Guides/push-kit-capability-0000001050986079
