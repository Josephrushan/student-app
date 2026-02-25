# Huawei Quick App - Firebase Integration Guide

## ✅ Push Notifications Fixed

The hello.ux file now:
- ✅ Uses `this.$service.push` instead of direct import
- ✅ Has fallback methods for `getRegistrationId` 
- ✅ Properly handles permission requests
- ✅ Safely checks if methods exist before calling them

## 🔧 Required Firebase Setup

### 1. Add app.educater.co.za to OAuth Authorized Domains

The warning about OAuth redirect domains needs to be fixed:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: **websitey-9f8e4**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Add: `app.educater.co.za`
6. Save

### 2. Enable APIs (if needed)

- Cloud Firestore ✅ (already enabled)
- Cloud Functions ✅ (already enabled)
- Cloud Storage ✅ (may need for images)

## 📱 How It Works Now

### Quick App Flow:
```
1. Hello.ux loads with web component
2. onInit() → initializePushNotifications()
3. Tries push.requestPermission (if available)
4. Calls push.getToken() to get Huawei regId
5. POST to saveHuaweiToken endpoint
6. Token stored in Firebase users.huawei_token
7. WebView loads your PWA at https://app.educater.co.za
```

### Firebase Messaging Error (Expected ⚠️)
The "Messaging: This browser doesn't support the API's required to use the Firebase SDK" error is **normal** in Huawei Quick App WebView. This is expected because:
- Quick App WebView doesn't support Service Worker properly for Firebase Messaging
- Push notifications go through Huawei Push Kit instead (which we've set up)
- The PWA still works fine for other features

**You can ignore this error** - it doesn't break your app.

## 🧪 Testing

### 1. Test Push Token Registration
Check in Firebase Console:
- Firestore → users collection
- Look for `huawei_token` field
- Should contain the registration ID from your device

### 2. Send Test Notification
```bash
curl -X POST https://us-central1-websitey-9f8e4.cloudfunctions.net/testHuaweiPush \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-device-user-id",
    "title": "Test Notification",
    "body": "This is a test from Firebase"
  }'
```

### 3. Send via Firestore
```javascript
// From your PWA code
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

await addDoc(collection(db, 'notifications'), {
  userId: 'test-user',
  title: 'Hello Quick App!',
  body: 'This notification was sent via Firebase',
  url: '/dashboard',
  timestamp: serverTimestamp()
});
```

## 💳 Paystack Integration

The `onPageFinish` listener now detects Paystack callbacks:
- Watches for URLs containing `standard.paystack.co/close`
- Waits 1.5 seconds for payment processing
- Automatically redirects to `/dashboard`

No additional setup needed - it's built into hello.ux

## 📋 Troubleshooting

### Push Token Not Showing in Firebase
1. ✅ Ensure device has internet connection
2. ✅ Check Huawei Push Kit is enabled (manifest.json)
3. ✅ Check browser console logs for errors
4. ✅ Verify `saveHuaweiToken` endpoint is accessible
5. Try manual test:
   ```bash
   curl -X POST https://us-central1-websitey-9f8e4.cloudfunctions.net/saveHuaweiToken?userId=test \
     -H "Content-Type: application/json" \
     -d '{"regId":"TEST_TOKEN_123","platform":"huawei_quickapp"}'
   ```

### Notifications Not Appearing
1. ✅ Verify user has token in Firebase (huawei_token field)
2. ✅ Check `sendHuaweiPushOnNotification` function logs
3. ✅ Test with `testHuaweiPush` endpoint
4. ✅ Verify Huawei credentials in Cloud Function are correct

### Firebase Messaging Error (Can Ignore)
This is expected in Huawei Quick App - use Huawei Push Kit instead (already set up)

## 🔗 Quick Links

- Firebase Console: https://console.firebase.google.com/project/websitey-9f8e4
- Save Token Function: https://us-central1-websitey-9f8e4.cloudfunctions.net/saveHuaweiToken
- Test Push Function: https://us-central1-websitey-9f8e4.cloudfunctions.net/testHuaweiPush
- PWA URL: https://app.educater.co.za

## ✅ Checklist

- [ ] Added app.educater.co.za to Firebase OAuth authorized domains
- [ ] Rebuilt and deployed Quick App
- [ ] Tested push token is saved to Firestore
- [ ] Sent test notification and received it on device
- [ ] Tested Paystack callback redirect
