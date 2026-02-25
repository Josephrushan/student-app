How to request native notifications from the web page inside the QuickApp webview:

Example helper to call from your page:
function notifyNative(title, body) {
  const msg = JSON.stringify({ type: 'notify', title: title, body: body });
  // post to QuickApp host
  if (window.parent && window.parent.postMessage) {
    window.parent.postMessage(msg, '*');
  } else if (window.postMessage) {
    // some environments may support direct postMessage
    window.postMessage(msg, '*');
  } else if (window.Notification) {
    // fallback to web Notification if available
    new Notification(title, { body });
  } else {
    console.log('notify fallback:', title, body);
  }
}

Usage:
notifyNative('New message', 'You have a new message in the app.');

Optional: listen for messages from the host (for future bridge signals)
window.addEventListener('message', (e) => {
  // handle messages from QuickApp host
});

How to receive the push token and request token from QuickApp host:

- The host will post a message { type: 'pushToken', token } to the page when a token is available.
- To request a fresh token from the host, call:
  window.parent && window.parent.postMessage && window.parent.postMessage(JSON.stringify({ type: 'requestPush' }), '*')

- The host responds with { type: 'pushTokenResponse', token, error }.

Example on the web page:
window.addEventListener('message', (e) => {
  try {
    const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
    if (msg.type === 'pushToken') { console.log('token', msg.token) }
    if (msg.type === 'pushTokenResponse') { /* handle token or error */ }
  } catch(e) {}
});

Request a token:
window.parent.postMessage(JSON.stringify({ type: 'requestPush' }), '*');

Server endpoints (example)
- POST /api/push/register
  Body: { token: '<push-token>', platform: 'huawei' }
  Stores the token on the server.

- POST /api/push/send
  Body: { title: '...', body: '...', tokens?: ['token1','token2'] }
  Sends a push notification via Huawei Push Kit (uses HUAWEI_CLIENT_ID, HUAWEI_CLIENT_SECRET, HUAWEI_APP_ID from Vercel env).

Required Vercel env vars (set in Project → Settings → Environment Variables)
- HUAWEI_CLIENT_ID (server)
- HUAWEI_CLIENT_SECRET (server ONLY)
- HUAWEI_APP_ID (server)
- (optional) HUAWEI_API_KEY, HUAWEI_PROJECT_ID, etc.

Examples:
- QuickApp/client: when you get a token, POST it to https://app.educater.co.za/api/push/register
- Server: call POST https://app.educater.co.za/api/push/send to push to stored tokens.

Notes
- These endpoints are example code. In production, use authenticated endpoints, persistent DB, and retry/error handling.
