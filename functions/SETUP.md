# Quick Setup Checklist

## Step 1: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

✅ Done! Your Huawei credentials are already configured.

## Step 2: Verify Setup

1. Create a test user in Firestore:
```javascript
// users collection
{
  id: "test-user-123",
  name: "Test User",
  huawei_token: "YOUR_REGID_FROM_DEVICE", // Get from Quick App logs
  email: "test@example.com"
}
```

2. Create a test notification:
```javascript
// notifications collection
{
  userId: "test-user-123",
  title: "Test Notification",
  body: "If you see this, it works!",
  timestamp: new Date()
}
```

3. Check Cloud Function logs:
```bash
firebase functions:log
```

## Step 3: Integrate with Your App

Add this to create notifications from anywhere in your app:

```typescript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const notifyUser = async (userId: string, title: string, body: string) => {
  await addDoc(collection(db, 'notifications'), {
    userId,
    title,
    body,
    url: '/',
    timestamp: serverTimestamp()
  });
};
```

## Step 4: Testing

```bash
# Test HTTP endpoint
curl -X POST https://region-project.cloudfunctions.net/testHuaweiPush \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123","title":"Test","body":"Test message"}'

# View logs
firebase functions:log --tail
```

## Troubleshooting

❌ **"Huawei credentials invalid"**
- Verify credentials in `functions/src/index.ts` match your Huawei Console
- Current credentials: Client ID 1877714599654983488, App ID 116819743
- Check Huawei AppGallery Connect for any updates

❌ **"No Huawei token found for user"**
- Device needs to register with Huawei Push Kit first
- Check user document has `huawei_token` field

❌ **"Function timeout"**
- Increase timeout in firebase.json
- Check network connectivity to Huawei servers

✅ **All working?**
- Notification should appear on your Huawei device within seconds
- Check Cloud Function logs for success message
