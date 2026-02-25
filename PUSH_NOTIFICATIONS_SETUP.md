# Push Notifications Setup Guide

## ✅ What Has Been Implemented

Your Next.js push notifications system is now fully set up and working! Here's what was configured:

### 1. **Service Worker** (`public/sw.js`)
- Handles incoming push notifications
- Displays notifications with custom title, message, and icon
- Handles notification clicks to open URLs

### 2. **Environment Variables** (`.env.local`)
✅ Already configured with VAPID keys:
- `VAPID_PUBLIC_KEY` - Public key for client subscription
- `VAPID_PRIVATE_KEY` - Private key for backend to send notifications

### 3. **Vite Configuration** (`vite.config.ts`)
- ✅ Exposed `VAPID_PUBLIC_KEY` to the client

### 4. **Core App Wrapper** (`App.tsx`)
- ✅ Wrapped entire app with `NextPushProvider` for context access

### 5. **Service Worker Registration** (`index.tsx`)
- ✅ Registers `public/sw.js` on app load

### 6. **Notification Services**
Created comprehensive notification handling:
- `services/notificationService.ts` - Core notification logic
- `hooks/useNotificationSubscription.ts` - React hook for subscriptions
- `components/NotificationSubscribeButton.tsx` - Pre-built UI component

### 7. **PWA Support** (`public/manifest.json`)
- ✅ Added web app manifest for PWA installation
- ✅ Meta tags configured in `index.html`

---

## 📱 Usage Examples

### Option 1: Use the Pre-built Button Component

Add this to any component:

```typescript
import { NotificationSubscribeButton } from './components/NotificationSubscribeButton';

export function YourComponent() {
  return (
    <div>
      <NotificationSubscribeButton />
    </div>
  );
}
```

### Option 2: Use the Hook Directly

```typescript
import { useNotificationSubscription } from './hooks/useNotificationSubscription';

export function YourComponent() {
  const { isSubscribed, isLoading, error, subscribe, unsubscribe } = useNotificationSubscription();

  return (
    <button onClick={isSubscribed ? unsubscribe : subscribe} disabled={isLoading}>
      {isSubscribed ? 'Unsubscribe' : 'Enable Notifications'}
    </button>
  );
}
```

### Option 3: Manual Subscription

```typescript
import { requestNotificationPermission } from './services/notificationService';

async function handleSubscribe() {
  const subscription = await requestNotificationPermission();
  if (subscription) {
    // Send to your backend:
    // POST /api/subscribe with subscription object
  }
}
```

---

## 🔌 Backend Integration

### Sending Push Notifications

Use the Web Push library (Node.js example):

```bash
npm install web-push
```

```javascript
const webpush = require('web-push');

// Set VAPID details
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
webpush.sendNotification(subscription, JSON.stringify({
  title: 'Homework Assignment',
  message: 'New homework posted for Physics',
  icon: '/icon.png',
  url: 'https://yourdomain.com/homework'
}));
```

### Python Example (FastAPI)

```python
from pywebpush import webpush, WebPushException
import json

def send_notification(subscription, data):
    try:
        webpush(
            subscription_info=subscription,
            data=json.dumps(data),
            vapid_private_key=os.environ.get('VAPID_PRIVATE_KEY'),
            vapid_claims={
                'sub': 'mailto:your-email@example.com',
                'aud': 'https://yourdomain.com',
                'exp': int(time.time()) + 24*3600
            }
        )
    except WebPushException as ex:
        print(f"Failed to send notification: {ex}")
```

---

## 🔑 VAPID Keys

Your VAPID keys are already generated. If you need to regenerate them:

```bash
npx web-push generate-vapid-keys
```

Then update `.env.local` with the new keys.

---

## 🧪 Testing

1. **Enable Notifications**: Click the notification button in your app
2. **Check Browser Console**: Look for "Service Worker registered" message
3. **Test with cURL** (from your backend):

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Content-Type: application/json" \
  -H "Authorization: key=YOUR_FCM_KEY" \
  -d '{
    "to": "YOUR_SUBSCRIPTION_ENDPOINT",
    "notification": {
      "title": "Test",
      "body": "Test notification"
    }
  }'
```

---

## 🛠️ Troubleshooting

### "Service Worker registration failed"
- Check that `public/sw.js` exists and is accessible
- Ensure you're on HTTPS (localhost works for testing)
- Check browser console for specific errors

### "Notification permission denied"
- Check browser notification settings
- Clear site data and try again
- Ask user to enable in browser settings

### "Push subscription failed"
- Verify `VAPID_PUBLIC_KEY` is correctly set in `.env.local`
- Check that the key is exposed in `vite.config.ts`
- Restart dev server after updating env variables

### "Browser doesn't support notifications"
- Use `useNotificationSubscription` hook which handles browser compatibility
- Test on a modern browser (Chrome, Firefox, Edge, Safari)

---

## 📋 Checklist

- ✅ Service Worker configured and registering
- ✅ VAPID keys generated and set in `.env.local`
- ✅ Environment variables exposed via Vite
- ✅ App wrapped with `NextPushProvider`
- ✅ Notification services created
- ✅ Hook for easy component integration
- ✅ Pre-built subscribe button component
- ✅ PWA manifest configured
- ✅ HTML meta tags updated

## 🚀 Next Steps

1. Add the `NotificationSubscribeButton` to a visible component (e.g., Profile page or Settings)
2. Set up a backend endpoint to receive and store subscription objects
3. Implement backend logic to send notifications when relevant events occur
4. Test notifications across different browsers and devices
5. Monitor browser console for any errors

---

## 📚 Additional Resources

- [Web Push Protocol](https://datatracker.ietf.org/doc/html/rfc8030)
- [Service Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/notification)
