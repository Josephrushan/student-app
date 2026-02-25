// notificationService.ts
// Service for handling push notifications and subscriptions
// Primary: OneSignal (works everywhere: web, iOS, Android, Huawei)
// Fallback: Web Push API, Huawei HMS Push, Firebase Messaging

import DeviceDetector from 'device-detector-js';
import { initializeHuaweiPushKit, getHuaweiPushToken, isHmsPushAvailable, isQuickApp } from './huaweiPushService';

export const requestNotificationPermission = async (): Promise<PushSubscription | null> => {
  try {
    console.log('🔔 Starting notification permission request...');
    
    // FALLBACK: HMS Push or Web Push for Huawei
    console.log('1️⃣ Attempting Huawei-specific push...');
    
    // Check if running in Quick App
    const quickApp = isQuickApp();
    console.log(`🚀 Environment: Quick App=${quickApp}`);
    
    // Log all available global objects that might help
    console.log('🔍 Available APIs in window:');
    console.log(`   - __push: ${typeof (window as any).__push}`);
    console.log(`   - service: ${typeof (window as any).service}`);
    console.log(`   - quickapp: ${typeof (window as any).quickapp}`);
    console.log(`   - hmscore: ${typeof (window as any).hmscore}`);
    console.log(`   - HMSMessaging: ${typeof (window as any).HMSMessaging}`);
    console.log(`   - HMSPush: ${typeof (window as any).HMSPush}`);
    console.log(`   - pushConfig: ${typeof (window as any).pushConfig}`);
    console.log(`   - __hmscore: ${typeof (window as any).__hmscore}`);
    console.log(`   - require: ${typeof (window as any).require}`);
    
    // Check if this is a Huawei device first
    const isHuawei = isHuaweiDevice();
    console.log(`📱 Device type check: isHuawei=${isHuawei}, userAgent=${navigator.userAgent.substring(0, 80)}...`);
    
    if (isHuawei || quickApp) {
      console.log('📱 Huawei device/Quick App detected - attempting HMS Push registration...');
      
      // Try to use Huawei HMS Push
      const hmsAvailable = isHmsPushAvailable();
      console.log(`🔍 HMS Push availability: ${hmsAvailable}`);
      console.log(`   - hmscore: ${typeof (window as any).hmscore !== 'undefined'}`);
      console.log(`   - __push: ${typeof (window as any).__push !== 'undefined'}`);
      console.log(`   - HMSMessaging: ${typeof (window as any).HMSMessaging !== 'undefined'}`);
      console.log(`   - service.push: ${typeof (window as any).service?.push !== 'undefined'}`);
      console.log(`   - require available: ${typeof (window as any).require === 'function'}`);
      
      if (hmsAvailable) {
        console.log('✅ HMS Push available - initializing...');
        const hmsPushToken = await getHuaweiPushToken();
        if (hmsPushToken) {
          console.log('✅ Huawei HMS/Quick App Push successfully configured - push token obtained');
          // Return a pseudo-subscription object for compatibility
          return {
            endpoint: `huawei:${hmsPushToken}`,
            getKey: () => null,
            toJSON: () => ({ endpoint: `huawei:${hmsPushToken}` })
          } as unknown as PushSubscription;
        }
      } else {
        console.log('ℹ️ HMS Push not available');
        console.log('⚠️ Troubleshooting:');
        console.log('   1. Verify this is running in Quick App (not browser)');
        console.log('   2. Check AppGallery Connect - @service.push MUST be enabled');
        console.log('   3. Ensure Quick App manifest includes push capability');
        console.log('   4. For web browsers: native push APIs are not available');
      }
      
      // Try to initialize Huawei Push Kit
      const token = await initializeHuaweiPushKit();
      if (token) {
        console.log('✅ Huawei Push Kit initialized - push token obtained');
        return {
          endpoint: `huawei:${token}`,
          getKey: () => null,
          toJSON: () => ({ endpoint: `huawei:${token}` })
        } as unknown as PushSubscription;
      }
      
      console.log('⚠️ HMS Push initialization failed');
      console.log('ℹ️ Note: Make sure this Quick App has push permissions configured');
    }

    // FINAL FALLBACK: Standard Web Push Notification flow for non-Huawei devices or when HMS isn't available
    console.log('2️⃣ Attempting standard Web Push notification setup (final fallback)...');
    
    // Browser support checks
    if (!('Notification' in window)) {
      console.warn('ℹ️ Notification API not supported in this browser');
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('ℹ️ Service Workers not supported in this browser');
      return null;
    }

    console.log('✅ Notification and Service Worker APIs supported');
    console.log('📍 Current permission:', Notification.permission);

    // Check if permission is denied
    if (Notification.permission === 'denied') {
      console.warn('⚠️ Notification permission has been denied by user');
      return null;
    }

    // Request permission if not already granted
    if (Notification.permission !== 'granted') {
      console.log('🔔 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('✅ Permission response:', permission);

      if (permission !== 'granted') {
        console.log('⚠️ User did not grant permission. Status:', permission);
        return null;
      }
    } else {
      console.log('✅ Notifications already granted');
    }

    // Get service worker registration with timeout
    console.log('⏳ Getting service worker registration...');

    const registrationPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
      setTimeout(() => reject(new Error('Service worker registration timeout')), 5000)
    );

    let registration: ServiceWorkerRegistration;
    try {
      registration = await Promise.race([registrationPromise, timeoutPromise]);
    } catch (err) {
      console.warn('⚠️ Service worker not ready, attempting manual registration...');
      try {
        registration = await navigator.serviceWorker.register('/sw.js');
      } catch (regErr) {
        console.warn('⚠️ Failed to register service worker:', regErr);
        return null;
      }
    }

    console.log('✅ Service worker registered');

    // Check if push manager is available
    if (!('pushManager' in registration)) {
      console.warn('ℹ️ Push messaging is not supported on this browser');
      return null;
    }

    // Subscribe to push notifications
    console.log('⏳ Subscribing to push notifications...');
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;

    if (!vapidKey) {
      console.warn('⚠️ VAPID public key not configured');
      return null;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      console.log('✅ Successfully subscribed to push notifications');
      return subscription;
    } catch (subErr) {
      console.warn('⚠️ Failed to subscribe to push notifications:', subErr);
      return null;
    }
  } catch (error) {
    console.warn('⚠️ Notification setup failed:', error);
    // Return null instead of throwing so app continues to work
    return null;
  }
};

export const unsubscribeFromNotifications = async (): Promise<boolean> => {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    
    if (!('pushManager' in registration)) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('✅ Successfully unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.warn('⚠️ Failed to unsubscribe from notifications:', error);
    return false;
  }
};

export const checkNotificationSubscription = async (): Promise<PushSubscription | null> => {
  try {
    // Check if browser supports Service Workers
    if (!('serviceWorker' in navigator)) {
      console.log('ℹ️ Service Workers not supported');
      return null;
    }

    // Check if Notification API is available
    if (!('Notification' in window)) {
      console.log('ℹ️ Notification API not supported');
      return null;
    }

    // Try to get the service worker registration with a timeout
    const registrationPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<ServiceWorkerRegistration>((_, reject) =>
      setTimeout(() => reject(new Error('Service worker timeout')), 3000)
    );

    let registration: ServiceWorkerRegistration;
    try {
      registration = await Promise.race([registrationPromise, timeoutPromise]);
    } catch (err) {
      console.log('ℹ️ Service worker registration not ready:', err);
      return null;
    }

    // Check if push manager is available
    if (!('pushManager' in registration)) {
      console.log('ℹ️ Push messaging not supported');
      return null;
    }

    // Get the subscription
    const subscription = await registration.pushManager.getSubscription();
    return subscription || null;
  } catch (error) {
    console.error('⚠️ Failed to check notification subscription:', error);
    return null;
  }
};

// Helper function to convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export const isHuaweiDevice = (): boolean => {
  try {
    // Method 1: device-detector-js
    const deviceDetector = new DeviceDetector();
    const userAgent = navigator.userAgent;
    const device = deviceDetector.parse(userAgent);

    if (device?.brand?.toLowerCase() === 'huawei') {
      console.log('✅ Huawei device detected via device-detector');
      return true;
    }

    // Method 2: Fallback - check user agent string directly for Huawei markers
    const ua = userAgent.toLowerCase();
    const huaweiMarkers = [
      'huawei',          // Direct Huawei mention
      'honor',           // Honor brand (Huawei subsidiary)
      'hmscore',         // Huawei Mobile Services marker
      'mar-',            // Huawei P series model ID
      'lya-',            // Huawei P series model ID
      'pel-',            // Huawei P series model ID
      'els-',            // Huawei P series model ID
      'eva-',            // Huawei P series model ID
      'lng-',            // Huawei Mate series
      'lrd-',            // Huawei Mate series
      'tnt-',            // Huawei Nova series
      'bah-',            // Huawei Y series
    ];

    const isHuaweiUA = huaweiMarkers.some(marker => ua.includes(marker));
    
    if (isHuaweiUA) {
      console.log('✅ Huawei device detected via user agent string');
      return true;
    }

    return false;
  } catch (err) {
    console.warn('⚠️ Error detecting device brand:', err);
    return false;
  }
};

export const initializePushNotifications = async () => {
  if (isHuaweiDevice()) {
    await initializeHuaweiPushKit();
  } else {
    console.log('Initializing Firebase Push Notifications...');
    // Add Firebase initialization logic here
  }
};