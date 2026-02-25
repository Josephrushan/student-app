import { isHuaweiDevice } from './notificationService';

// Detect if running in Huawei Quick App environment
export const isQuickApp = (): boolean => {
  try {
    // Standard Quick App detection methods
    if (typeof (window as any).__push !== 'undefined') {
      console.log('✅ Quick App detected: __push API available');
      return true;
    }
    
    // Global Quick App object (might be available)
    if (typeof (window as any).quickapp !== 'undefined') {
      console.log('✅ Quick App detected: window.quickapp available');
      return true;
    }
    
    // Huawei service object
    if (typeof (window as any).service !== 'undefined') {
      console.log('✅ Quick App detected: window.service available');
      if (typeof (window as any).service.push !== 'undefined') {
        console.log('  └─ service.push found');
        return true;
      }
    }
    
    // Require function (AMD-style modules)
    if (typeof (window as any).require === 'function') {
      try {
        (window as any).require('@service.push');
        console.log('✅ Quick App detected: @service.push module available');
        return true;
      } catch (e) {
        // Not a Quick App, continue
      }
    }
    
    // Check for Huawei-specific globals that indicate Quick App
    if (typeof (window as any).__hmscore !== 'undefined' || 
        typeof (window as any).pushConfig !== 'undefined' ||
        typeof (window as any).HMSPush !== 'undefined') {
      console.log('✅ Quick App likely detected: Huawei-specific globals found');
      return true;
    }
    
    return false;
  } catch (err) {
    console.warn('⚠️ Error detecting Quick App:', err);
    return false;
  }
};

export const getHuaweiConfig = () => {
  return {
    developerId: process.env.REACT_APP_HUAWEI_DEVELOPER_ID,
    publicKey: process.env.REACT_APP_HUAWEI_PUBLIC_KEY,
    projectName: process.env.REACT_APP_HUAWEI_PROJECT_NAME,
    projectId: process.env.REACT_APP_HUAWEI_PROJECT_ID,
    dataLocation: process.env.REACT_APP_HUAWEI_DATA_LOCATION,
    clientId: process.env.REACT_APP_HUAWEI_CLIENT_ID,
    clientSecret: process.env.REACT_APP_HUAWEI_CLIENT_SECRET,
    apiKey: process.env.REACT_APP_HUAWEI_API_KEY,
    packageName: process.env.REACT_APP_HUAWEI_PACKAGE_NAME,
    appId: process.env.REACT_APP_HUAWEI_APP_ID,
    oauthClientId: process.env.REACT_APP_HUAWEI_OAUTH_CLIENT_ID,
    oauthClientSecret: process.env.REACT_APP_HUAWEI_OAUTH_CLIENT_SECRET,
  };
};

// Check if Huawei HMS Push is available in the browser/app environment
export const isHmsPushAvailable = (): boolean => {
  try {
    // Check for HMS availability in the global scope
    if (typeof (window as any).hmscore !== 'undefined') {
      console.log('✅ Huawei HMS Core detected');
      return true;
    }
    
    // Check for Quick App push service
    if (typeof (window as any).__push !== 'undefined') {
      console.log('✅ Huawei Quick App push service detected');
      return true;
    }
    
    // Check for messaging service
    if (typeof (window as any).HMSMessaging !== 'undefined') {
      console.log('✅ Huawei Messaging service detected');
      return true;
    }

    // For older Huawei devices, check for service.push (Quick App service)
    if (typeof (window as any).service !== 'undefined' && typeof (window as any).service.push !== 'undefined') {
      console.log('✅ Huawei service.push detected (older device)');
      return true;
    }

    // Check for push in require (Quick App AMD-style module)
    if (typeof (window as any).require === 'function') {
      try {
        const push = (window as any).require('@service.push');
        if (push) {
          console.log('✅ Huawei @service.push module detected');
          return true;
        }
      } catch (e) {
        // Module not found, continue checking
      }
    }
    
    return false;
  } catch (err) {
    return false;
  }
};

// Get Huawei HMS Push token for push notifications
export const getHuaweiPushToken = async (): Promise<string | null> => {
  try {
    console.log('🔔 Attempting to get Huawei HMS Push token...');
    
    // Method 1: HMS Core available
    if (typeof (window as any).hmscore !== 'undefined') {
      try {
        const hms = (window as any).hmscore;
        if (hms.messaging && typeof hms.messaging.getToken === 'function') {
          console.log('📡 Using HMS Core messaging.getToken()');
          const token = await hms.messaging.getToken();
          if (token) {
            console.log('✅ Huawei HMS Push token obtained:', token.substring(0, 20) + '...');
            return token;
          }
        }
      } catch (hmsErr) {
        console.log('⚠️ HMS Core token retrieval failed:', hmsErr);
      }
    }
    
    // Method 2: Quick App push service (@service.push or __push)
    if (typeof (window as any).__push !== 'undefined') {
      try {
        const push = (window as any).__push;
        if (typeof push.getToken === 'function') {
          console.log('📡 Using Quick App push.getToken()');
          const token = await new Promise<string>((resolve, reject) => {
            push.getToken(
              (token: string) => resolve(token),
              (error: any) => reject(error)
            );
          });
          if (token) {
            console.log('✅ Huawei Quick App Push token obtained:', token.substring(0, 20) + '...');
            return token;
          }
        }
      } catch (qaErr) {
        console.log('⚠️ Quick App token retrieval failed:', qaErr);
      }
    }

    // Method 3: For older devices - service.push module
    if (typeof (window as any).service !== 'undefined' && typeof (window as any).service.push !== 'undefined') {
      try {
        const push = (window as any).service.push;
        if (typeof push.getToken === 'function') {
          console.log('📡 Using service.push.getToken() (older device)');
          const token = await new Promise<string>((resolve, reject) => {
            push.getToken({
              success: (token: string) => resolve(token),
              fail: (error: any) => reject(error)
            });
          });
          if (token) {
            console.log('✅ Huawei service.push token obtained:', token.substring(0, 20) + '...');
            return token;
          }
        }
      } catch (spErr) {
        console.log('⚠️ service.push token retrieval failed:', spErr);
      }
    }
    
    // Method 4: Direct Messaging API
    if (typeof (window as any).HMSMessaging !== 'undefined') {
      try {
        const messaging = (window as any).HMSMessaging;
        if (typeof messaging.getToken === 'function') {
          console.log('📡 Using HMSMessaging.getToken()');
          const token = await messaging.getToken();
          if (token) {
            console.log('✅ Huawei Messaging token obtained:', token.substring(0, 20) + '...');
            return token;
          }
        }
      } catch (msgErr) {
        console.log('⚠️ HMSMessaging token retrieval failed:', msgErr);
      }
    }

    // Method 5: Try require() for Quick App modules
    if (typeof (window as any).require === 'function') {
      try {
        const push = (window as any).require('@service.push');
        if (push && typeof push.getToken === 'function') {
          console.log('📡 Using require(@service.push).getToken()');
          const token = await new Promise<string>((resolve, reject) => {
            push.getToken({
              success: (token: string) => resolve(token),
              fail: (error: any) => reject(error)
            });
          });
          if (token) {
            console.log('✅ Huawei @service.push token obtained:', token.substring(0, 20) + '...');
            return token;
          }
        }
      } catch (reqErr) {
        console.log('⚠️ require(@service.push) token retrieval failed:', reqErr);
      }
    }
    
    console.warn('⚠️ Unable to obtain Huawei push token from available APIs');
    return null;
  } catch (error) {
    console.error('❌ Error getting Huawei push token:', error);
    return null;
  }
};

// Initialize Huawei Push for the application
export const initializeHuaweiPushKit = async (): Promise<string | null> => {
  const config = getHuaweiConfig();

  if (!config.clientId || !config.clientSecret) {
    console.warn('⚠️ Huawei Push Kit configuration is incomplete');
  }

  try {
    console.log('🔔 Initializing Huawei Push Kit...');
    
    // Check if HMS is available
    if (!isHmsPushAvailable()) {
      console.log('ℹ️ HMS Push is not available in this environment');
      return null;
    }
    
    // Get the push token
    const token = await getHuaweiPushToken();
    
    if (token) {
      console.log('✅ Huawei Push Kit initialized successfully');
      return token;
    } else {
      console.warn('⚠️ Failed to initialize Huawei Push Kit - unable to obtain token');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to initialize Huawei Push Kit:', error);
    return null;
  }
};

// Listen to push messages from Huawei
export const setupHuaweiPushListener = (onMessage: (data: any) => void): (() => void) | null => {
  try {
    // Method 1: HMS Core listener
    if (typeof (window as any).hmscore !== 'undefined') {
      const hms = (window as any).hmscore;
      if (hms.messaging && typeof hms.messaging.onMessage === 'function') {
        console.log('📡 Setting up HMS Core message listener');
        const unsubscribe = hms.messaging.onMessage((message: any) => {
          console.log('📨 Received HMS message:', message);
          onMessage(message);
        });
        return () => {
          if (typeof unsubscribe === 'function') unsubscribe();
        };
      }
    }
    
    // Method 2: Quick App listener (__push)
    if (typeof (window as any).__push !== 'undefined') {
      const push = (window as any).__push;
      if (typeof push.on === 'function') {
        console.log('📡 Setting up Quick App (__push) message listener');
        push.on('push', (message: any) => {
          console.log('📨 Received Quick App message:', message);
          onMessage(message);
        });
        return () => {
          if (typeof push.off === 'function') push.off('push');
        };
      }
    }

    // Method 3: Older Huawei devices (service.push)
    if (typeof (window as any).service !== 'undefined' && typeof (window as any).service.push !== 'undefined') {
      const push = (window as any).service.push;
      if (typeof push.on === 'function') {
        console.log('📡 Setting up service.push message listener (older device)');
        push.on('push', (message: any) => {
          console.log('📨 Received service.push message:', message);
          onMessage(message);
        });
        return () => {
          if (typeof push.off === 'function') push.off('push');
        };
      }
    }

    // Method 4: Direct Messaging API
    if (typeof (window as any).HMSMessaging !== 'undefined') {
      const messaging = (window as any).HMSMessaging;
      if (typeof messaging.onMessage === 'function') {
        console.log('📡 Setting up HMSMessaging listener');
        const unsubscribe = messaging.onMessage((message: any) => {
          console.log('📨 Received HMSMessaging message:', message);
          onMessage(message);
        });
        return () => {
          if (typeof unsubscribe === 'function') unsubscribe();
        };
      }
    }

    // Method 5: Try require() for Quick App modules
    if (typeof (window as any).require === 'function') {
      try {
        const push = (window as any).require('@service.push');
        if (push && typeof push.on === 'function') {
          console.log('📡 Setting up require(@service.push) listener');
          push.on('push', (message: any) => {
            console.log('📨 Received @service.push message:', message);
            onMessage(message);
          });
          return () => {
            if (typeof push.off === 'function') push.off('push');
          };
        }
      } catch (e) {
        console.log('⚠️ require(@service.push) listener setup failed:', e);
      }
    }
    
    return null;
  } catch (error) {
    console.error('⚠️ Error setting up Huawei push listener:', error);
    return null;
  }
};
