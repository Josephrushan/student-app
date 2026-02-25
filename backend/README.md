# Educater Backend Server

Backend server for the Educater app - handles push notifications and other backend operations.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Edit `backend/.env` with your VAPID keys:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Get these from your frontend .env.local
VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
```

### 3. Start the Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server will start on `http://localhost:5000`

## API Endpoints

### 1. POST `/api/send-push`

Send a push notification to a single user.

**Request:**
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
      "title": "New Message",
      "message": "You have a new message",
      "icon": "/icon.png",
      "url": "/inbox"
    }
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Push notification sent"
}
```

**Response (Error - Subscription Expired):**
```json
{
  "error": "Subscription expired",
  "details": "User needs to re-enable notifications"
}
```

### 2. POST `/api/send-push-to-multiple`

Send push notifications to multiple users (broadcast).

**Request:**
```bash
curl -X POST http://localhost:5000/api/send-push-to-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptions": [
      {
        "endpoint": "https://fcm.googleapis.com/fcm/send/...",
        "keys": {"p256dh": "...", "auth": "..."}
      },
      {
        "endpoint": "https://fcm.googleapis.com/fcm/send/...",
        "keys": {"p256dh": "...", "auth": "..."}
      }
    ],
    "payload": {
      "title": "Important Announcement",
      "message": "School closure tomorrow",
      "icon": "/icon.png",
      "url": "/announcements"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast notification sent",
  "results": {
    "sent": 2,
    "failed": 0,
    "expired": 1
  }
}
```

### 3. GET `/health`

Health check endpoint.

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "Backend is running ✅",
  "timestamp": "2026-01-24T12:00:00.000Z"
}
```

### 4. POST `/api/test-push` (Development Only)

Send a test notification to verify setup.

```bash
curl -X POST http://localhost:5000/api/test-push \
  -H "Content-Type: application/json" \
  -d '{
    "subscription": {
      "endpoint": "https://fcm.googleapis.com/fcm/send/...",
      "keys": {"p256dh": "...", "auth": "..."}
    }
  }'
```

## Integration with Frontend

### Sending Notifications from Frontend

The frontend has a `sendPushNotificationToUser()` function that:
1. Fetches the user's subscriptions from Firebase
2. Sends each subscription to `/api/send-push`

Usage:

```typescript
import { sendPushNotificationToUser } from '../services/pushNotificationService';

// When user sends a message
await sendPushNotificationToUser(recipientId, {
  title: 'New message from ' + senderName,
  message: messageText,
  icon: senderAvatar,
  url: '/inbox'
});
```

### Subscriptions Storage

User push subscriptions are stored in Firebase Firestore:

```
pushSubscriptions/{userId}_{timestamp}
├── userId: string
├── endpoint: string
├── keys: object
│   ├── p256dh: string
│   └── auth: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

## Error Handling

### 410 Subscription Expired

The subscription is no longer valid. This happens when:
- User unsubscribed
- Browser cleared the subscription
- Subscription expired after ~60 days

**Action:** User needs to re-enable notifications from profile page.

### 401 Authentication Failed

VAPID keys are invalid or not properly configured.

**Action:** Check `.env` file has correct VAPID keys from frontend `.env.local`.

### 400 Bad Request

Invalid request format or missing required fields.

**Action:** Ensure request includes both `subscription` and `payload` objects.

## Logging

The server logs important events:

```
📤 Sending push notification...
   Title: New Message
   Message: Hello!
   URL: /inbox
✅ Push notification sent successfully
```

```
📤 Sending broadcast notification to 50 user(s)...
✅ Broadcast complete: 48 sent, 1 failed, 1 expired
```

```
❌ Push notification error: [401] Invalid credentials
```

## Development

### Environment Variables

In development, you can use:
- `NODE_ENV=development` - Enables test endpoints and verbose logging
- `PORT=5000` - Server port
- `FRONTEND_URL=http://localhost:3000` - CORS origin

### Testing

1. **Health Check:**
```bash
curl http://localhost:5000/health
```

2. **Send Test Notification:**
   - Enable notifications in frontend
   - Copy subscription from browser DevTools
   - POST to `/api/test-push`

3. **Monitor Logs:**
   - Server logs all push notifications
   - Check for ✅ (success) and ❌ (error) indicators

## Production Deployment

### Before Deploying:

1. Set `NODE_ENV=production`
2. Use strong VAPID keys (kept secure)
3. Update `FRONTEND_URL` to your domain
4. Ensure HTTPS on frontend
5. Use production database
6. Set up monitoring/logging

### Deploy Options:

- **Heroku:** Add `Procfile` with `web: npm start`
- **Vercel/Firebase Functions:** Migrate to serverless
- **AWS/GCP:** Use your preferred deployment method

## Troubleshooting

### Server won't start

```
npm run dev
# Check if port 5000 is in use
lsof -i :5000
# Kill existing process if needed
kill -9 <PID>
```

### Notifications not sending

1. Check VAPID keys in `.env`
2. Verify subscription object in Firebase
3. Ensure frontend is calling `/api/send-push`
4. Check server logs for errors
5. Test with `/api/test-push` endpoint

### CORS errors

Update `FRONTEND_URL` in `.env` to match frontend origin.

## Project Structure

```
backend/
├── server.js              # Main server file
├── routes/
│   └── push.js           # Push notification endpoints
├── package.json          # Dependencies
├── .env                  # Environment variables
├── .gitignore            # Git ignore rules
└── README.md            # This file
```

## Dependencies

- **express** - Web framework
- **web-push** - Web Push protocol implementation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable loading
- **firebase-admin** - Firebase admin SDK (for future use)

## Support

For issues or questions, check:
1. Server logs for error messages
2. VAPID keys configuration
3. Subscription validity
4. CORS settings
5. Frontend integration code

---

**Ready to send notifications!** 🚀
