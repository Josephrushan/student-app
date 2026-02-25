# Push Notifications Architecture Diagram

## System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER / DEVICE                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          Your React Application (App.tsx)               │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │         NextPushProvider (Context)                │ │     │
│  │  │  ┌──────────────────────────────────────────────┐ │ │     │
│  │  │  │  Components (e.g., ProfileModule)           │ │ │     │
│  │  │  │  ┌────────────────────────────────────────┐ │ │ │     │
│  │  │  │  │  NotificationSubscribeButton           │ │ │ │     │
│  │  │  │  │  or useNotificationSubscription hook   │ │ │ │     │
│  │  │  │  └────────────────────────────────────────┘ │ │ │     │
│  │  │  └──────────────────────────────────────────────┘ │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          Services Layer (services/)                      │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  notificationService.ts                           │ │     │
│  │  │  • requestNotificationPermission()                │ │     │
│  │  │  • unsubscribeFromNotifications()                 │ │     │
│  │  │  • checkNotificationSubscription()                │ │     │
│  │  │  • urlBase64ToUint8Array()                        │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          Hooks Layer (hooks/)                            │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  useNotificationSubscription.ts                    │ │     │
│  │  │  Returns:                                         │ │     │
│  │  │  • isSubscribed: boolean                          │ │     │
│  │  │  • isLoading: boolean                             │ │     │
│  │  │  • error: string | null                           │ │     │
│  │  │  • subscribe(): Promise<void>                     │ │     │
│  │  │  • unsubscribe(): Promise<void>                   │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          Browser APIs                                    │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  Service Worker (public/sw.js)                    │ │     │
│  │  │  • Registers during app startup (index.tsx)       │ │     │
│  │  │  • Handles 'push' events                          │ │     │
│  │  │  • Displays notifications via Notification API    │ │     │
│  │  │  • Handles 'notificationclick' events             │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  │                                                            │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  Push API / Push Service                          │ │     │
│  │  │  • Manages push subscriptions                     │ │     │
│  │  │  • Returns PushSubscription object                │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  │                                                            │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  Notification API                                 │ │     │
│  │  │  • Shows notifications to user                    │ │     │
│  │  │  • Handles notification interactions              │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
                           ▼
                 [BROWSER'S PUSH SERVICE]
                 (e.g., Firebase Cloud Messaging)
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                     YOUR BACKEND SERVER                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          API Endpoints                                   │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  POST /api/subscriptions                          │ │     │
│  │  │  • Receive and store subscription objects         │ │     │
│  │  │  • Associate with userId                          │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  │                                                            │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  POST /api/send-notification                      │ │     │
│  │  │  • Send push notifications to users               │ │     │
│  │  │  • Use web-push library                           │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          Database                                        │     │
│  │  ┌────────────────────────────────────────────────────┐ │     │
│  │  │  subscriptions table                              │ │     │
│  │  │  • userId → PushSubscription mapping              │ │     │
│  │  │  • Stores endpoint, p256dh, auth                  │ │     │
│  │  └────────────────────────────────────────────────────┘ │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │          Triggers for Notifications                      │     │
│  │  • New homework assignment → send notification           │     │
│  │  • Student alert → send to parents                       │     │
│  │  • Chat message → notify recipient                       │     │
│  │  • Calendar event reminder → send alert                  │     │
│  │  • Announcement → broadcast to staff                     │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow: Subscribe to Notifications

```
User clicks "Enable Notifications" button
                    │
                    ▼
notificationService.requestNotificationPermission()
                    │
                    ├─→ Check browser support
                    │
                    ├─→ Request Notification.permission
                    │
                    ├─→ Get Service Worker registration
                    │
                    ├─→ Call pushManager.subscribe({
                    │      userVisibleOnly: true,
                    │      applicationServerKey: VAPID_PUBLIC_KEY
                    │   })
                    │
                    ▼
Browser Push Service generates PushSubscription
                    │
                    ├─→ endpoint: "https://push-service.com/push/..."
                    ├─→ p256dh: encrypted key
                    └─→ auth: authentication token
                    │
                    ▼
Frontend should send subscription to backend
                    │
POST /api/subscriptions
{
  "userId": "user123",
  "subscription": {
    "endpoint": "...",
    "keys": { "p256dh": "...", "auth": "..." }
  }
}
                    │
                    ▼
Backend stores in database
```

## Data Flow: Send Notification

```
Event triggers on backend
(new homework, alert, message, etc.)
                    │
                    ▼
Backend retrieves subscription from database
for affected user(s)
                    │
                    ▼
webpush.sendNotification(subscription, {
  title: "New Homework",
  message: "Physics assignment due tomorrow",
  icon: "/icon.png",
  url: "/homework"
})
                    │
                    ▼
Web Push Protocol sends to browser's push service
                    │
                    ▼
Push service wakes up browser / device
                    │
                    ▼
Service Worker 'push' event listener triggered
                    │
                    ▼
sw.js: self.registration.showNotification()
                    │
                    ├─→ Displays notification to user
                    │   (even if app is closed!)
                    │
                    ▼
User sees notification
                    │
User clicks notification
                    │
                    ▼
sw.js: 'notificationclick' event listener
                    │
                    ▼
Opens specified URL (from data.url)
                    │
                    ▼
Browser focuses / opens app to that page
```

## File Structure

```
your-app/
├── public/
│   ├── sw.js                    ← Service Worker (handles push events)
│   ├── manifest.json            ← PWA manifest
│   └── icon.png                 ← Notification icon
│
├── services/
│   ├── notificationService.ts   ← Core notification logic
│   ├── firebaseService.ts       ← (existing)
│   └── geminiService.ts         ← (existing)
│
├── hooks/
│   └── useNotificationSubscription.ts  ← React hook for components
│
├── components/
│   ├── NotificationSubscribeButton.tsx ← Pre-built UI component
│   ├── NotificationsModule.tsx         ← (existing)
│   └── ... other components
│
├── App.tsx                      ← Wrapped with NextPushProvider
├── index.tsx                    ← Service worker registered here
├── vite.config.ts               ← VAPID_PUBLIC_KEY exposed
├── index.html                   ← Manifest and meta tags
├── .env.local                   ← VAPID keys stored
│
├── PUSH_NOTIFICATIONS_SETUP.md           ← Complete documentation
├── NOTIFICATIONS_QUICK_REFERENCE.md      ← Code snippets
└── IMPLEMENTATION_SUMMARY.md             ← This implementation
```

## Component Integration Example

```typescript
┌─────────────────────────────────────────────────────────────┐
│  ProfileModule.tsx                                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  import { NotificationSubscribeButton } from ...            │
│  import { useNotificationSubscription } from ...            │
│                                                              │
│  export function ProfileModule() {                          │
│    // Option 1: Use pre-built component                    │
│    return <NotificationSubscribeButton />                   │
│                                                              │
│    // Option 2: Use hook for custom UI                     │
│    const { isSubscribed, subscribe } = ...                 │
│    return (                                                │
│      <button onClick={subscribe}>                          │
│        Enable Notifications                                │
│      </button>                                             │
│    )                                                       │
│  }                                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
            │
            │ Uses hook/component
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  useNotificationSubscription (hook)                          │
├─────────────────────────────────────────────────────────────┤
│  • Manages subscription state                               │
│  • Provides subscribe/unsubscribe functions                 │
│  • Handles errors and loading                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
            │
            │ Calls
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  notificationService (service)                              │
├─────────────────────────────────────────────────────────────┤
│  • requestNotificationPermission()                          │
│  • unsubscribeFromNotifications()                           │
│  • checkNotificationSubscription()                          │
│  • urlBase64ToUint8Array() (helper)                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
            │
            │ Uses
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  Browser APIs                                                │
├─────────────────────────────────────────────────────────────┤
│  • Notification API (request permission)                    │
│  • ServiceWorker API (get registration)                     │
│  • Push API (subscribe to push)                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
            │
            │ Coordinates with
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│  Service Worker (public/sw.js)                              │
├─────────────────────────────────────────────────────────────┤
│  • Listens for 'push' events                                │
│  • Displays notifications                                   │
│  • Handles notification clicks                              │
│  • Runs in background                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security & Best Practices

```
┌─────────────────────────────────────────────────────────────┐
│  SECURITY CONSIDERATIONS                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  VAPID Keys:                                               │
│  • ✅ Stored in .env.local (NOT in git)                    │
│  • ✅ Private key NEVER sent to client                     │
│  • ✅ Public key exposed to client via vite.config.ts      │
│                                                              │
│  Subscriptions:                                            │
│  • ✅ Store per user in database                           │
│  • ✅ Validate user authorization before sending           │
│  • ✅ Clean up old/invalid subscriptions                   │
│                                                              │
│  HTTPS:                                                    │
│  • ✅ Required for production                              │
│  • ✅ Localhost works for development                      │
│  • ❌ HTTP will fail in production                         │
│                                                              │
│  Permissions:                                              │
│  • ✅ Request permission explicitly                        │
│  • ✅ Handle denial gracefully                             │
│  • ✅ Respect user's browser settings                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

This complete architecture ensures:
- ✅ Scalable push notification system
- ✅ Works offline and when app is closed
- ✅ Proper error handling and fallbacks
- ✅ User-friendly subscription management
- ✅ Secure VAPID key handling
