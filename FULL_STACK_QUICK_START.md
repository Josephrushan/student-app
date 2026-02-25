# 🚀 Full Stack Push Notifications - Quick Start

You now have a complete push notification system with frontend and backend!

## 📁 Project Structure

```
your-app/
├── Frontend (Vite + React)
│   ├── services/pushNotificationService.ts
│   ├── hooks/useNotificationSubscription.ts
│   ├── components/NotificationSubscribeButton.tsx
│   ├── .env.local (VAPID keys)
│   └── vite.config.ts
│
└── Backend (Express + Node.js) 🆕
    ├── server.js
    ├── routes/push.js
    ├── .env (VAPID keys)
    └── package.json
```

---

## ⚡ Quick Start (5 minutes)

### Step 1: Install & Start Backend

```bash
cd backend
npm install
npm run dev
```

✅ Backend running on `http://localhost:5000`

### Step 2: Start Frontend (in another terminal)

```bash
npm run dev
```

✅ Frontend running on `http://localhost:3000`

### Step 3: Test It

1. Go to **Profile page**
2. Click **"Enable Notifications"**
3. Grant permission
4. ✅ Subscription saved to Firebase!

### Step 4: Send a Notification

**Option A: From Frontend**

```typescript
import { sendPushNotificationToUser } from './services/pushNotificationService';

// When user sends a message, etc:
await sendPushNotificationToUser(recipientUserId, {
  title: 'New Message',
  message: 'Hello there!',
  icon: '/icon.png',
  url: '/inbox'
});
```

**Option B: Direct Backend Test**

```bash
curl -X POST http://localhost:5000/api/send-push \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": { /* from Firebase */ },
    "payload": {
      "title": "Test",
      "message": "Hello!",
      "url": "/"
    }
  }'
```

---

## 🎯 What's Included

### Frontend ✅
- [x] Service Worker (public/sw.js)
- [x] Notification hook (useNotificationSubscription)
- [x] Subscribe button component
- [x] Firebase subscription storage
- [x] Push sending function (sendPushNotificationToUser)
- [x] Toast notifications (sonner)

### Backend 🆕
- [x] Express server
- [x] `/api/send-push` endpoint
- [x] `/api/send-push-to-multiple` endpoint
- [x] Web Push protocol implementation
- [x] Error handling & validation
- [x] CORS configured
- [x] Health check endpoint

---

## 📝 Next Steps

### 1. Integrate with Your Features

**Send notification when user sends message:**

```typescript
// In InboxModule.tsx
import { sendPushNotificationToUser } from '../services/pushNotificationService';

const handleSendMessage = async (recipientId, messageText) => {
  // Save message
  await saveDoc('messages', messageId, messageData);
  
  // Send notification
  await sendPushNotificationToUser(recipientId, {
    title: `Message from ${currentUser.name}`,
    message: messageText.substring(0, 50),
    icon: currentUser.avatar,
    url: '/inbox'
  });
};
```

**Send notification for homework assignment:**

```typescript
// In HomeworkModule.tsx
const handleCreateAssignment = async (assignment) => {
  // Save assignment
  await saveDoc('assignments', assignmentId, assignment);
  
  // Notify all students in that grade
  const students = allUsers.filter(u => u.grade === assignment.grade);
  for (const student of students) {
    await sendPushNotificationToUser(student.id, {
      title: 'New Homework',
      message: assignment.title,
      icon: '/homework-icon.png',
      url: '/homework'
    });
  }
};
```

### 2. Backend Configuration

Edit `backend/.env` with your actual keys if different:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
VAPID_PUBLIC_KEY=your-key-from-env.local
VAPID_PRIVATE_KEY=your-key-from-env.local
```

### 3. Deploy

**Frontend:**
```bash
npm run build
# Deploy to Vercel, Netlify, etc
```

**Backend:**
```bash
# Option 1: Heroku
git push heroku main

# Option 2: Railway
railway deploy

# Option 3: Your own server
npm install -g pm2
pm2 start server.js
```

---

## 🧪 Testing

### Test 1: Enable Notifications
1. Go to Profile
2. Click "Enable Notifications"
3. Grant permission
4. Check browser console: ✅ "Push subscription saved to Firebase"
5. Check Firebase: See new doc in `pushSubscriptions` collection

### Test 2: Send Notification
```bash
# From terminal, get subscription from Firebase
curl -X POST http://localhost:5000/api/send-push \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/...",
      "keys": {"p256dh": "...", "auth": "..."}
    },
    "payload": {
      "title": "Test",
      "message": "If you see this, it works!",
      "url": "/"
    }
  }'
```

### Test 3: Minimize App
1. Send notification from curl or code
2. **Minimize app or switch to another tab**
3. ✅ See notification pop-up!
4. Click it to return to app

---

## 📋 Checklist

- [ ] Backend installed (`npm install` in backend folder)
- [ ] Backend started (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Notifications enabled on profile
- [ ] Subscription appears in Firebase
- [ ] Backend receives test push request
- [ ] Notification appears when app minimized
- [ ] Click notification opens correct URL
- [ ] Integrated with message sending
- [ ] Integrated with homework assignments
- [ ] Integrated with alerts
- [ ] Integrated with announcements
- [ ] Backend deployed to production
- [ ] Frontend deployed with HTTPS

---

## 🐛 Troubleshooting

### "Cannot find module"
```bash
cd backend
npm install
```

### "EADDRINUSE: port 5000 already in use"
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

### "Subscription expired"
User disabled notifications. They need to re-enable from profile.

### "No notifications in background"
- Ensure app is minimized/minimized
- Check backend `/api/send-push` response (200 OK?)
- Check browser console for errors
- Verify subscription in Firebase is valid

### "CORS error"
Edit `backend/.env` - make sure `FRONTEND_URL` matches your frontend origin.

---

## 📚 Documentation

- [Frontend Setup](./PUSH_NOTIFICATIONS_SETUP.md)
- [Backend Setup](./BACKEND_PUSH_SETUP.md)
- [Backend README](./backend/README.md)
- [Architecture](./ARCHITECTURE_DIAGRAM.md)

---

## ✨ You're Ready!

Your push notification system is complete and ready to use! 

**Next time a user:**
- Gets a message → notification ✅
- Has homework assigned → notification ✅
- Gets an alert → notification ✅
- Sees an announcement → notification ✅

All while the app is in the background! 🚀

---

Need help? Check the docs or the error logs - they're very detailed!
