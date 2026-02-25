// Huawei Push Kit Initialization with Dynamic Credentials
import('./common/pushNotification.js').then(helpers => {
  console.log('Push notification helpers loaded');
}).catch(err => {
  console.error('Failed to load push notification helpers:', err);
});

// Function to fetch Huawei credentials from Vercel
async function fetchHuaweiCredentials() {
  try {
    const response = await fetch('https://educaters-6sl6.vercel.app/api/huawei-credentials')
    if (!response.ok) {
      throw new Error(`Failed to fetch credentials: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching Huawei credentials:", error)
    return null
  }
}

// Check if device is Huawei
const isHuaweiDevice = () => {
  return typeof globalThis.isHuaweiDevice === 'function' ? globalThis.isHuaweiDevice() : false;
};

if (isHuaweiDevice()) {
  console.log("Huawei device detected. Fetching credentials...")

  fetchHuaweiCredentials().then(credentials => {
    if (credentials && credentials.appId) {
      console.log("Initializing Huawei Push Kit...")

      // Initialize Huawei Push Kit
      hms.push.init({
        appId: credentials.appId
      }).then(() => {
        console.log("Huawei Push Kit initialized successfully.")

        // Subscribe to push notifications
        hms.push.subscribe("default").then(() => {
          console.log("Subscribed to default topic.")
        }).catch(err => {
          console.error("Failed to subscribe to topic:", err)
        })

        // Handle incoming messages
        hms.push.onMessageReceived((message) => {
          console.log("Push message received:", message)
          // Handle the push message here
        })
      }).catch(err => {
        console.error("Failed to initialize Huawei Push Kit:", err)
      })
    } else {
      console.error("Huawei credentials are invalid or missing.")
    }
  })
} else {
  console.log("Non-Huawei device detected. Falling back to default push notification service...")

  // Fallback to existing push notification implementation
  if (typeof defaultPushService !== 'undefined') {
    defaultPushService.init()
    console.log("Default push notification service initialized.")
  } else {
    console.warn("Default push notification service is not available.")
  }
}