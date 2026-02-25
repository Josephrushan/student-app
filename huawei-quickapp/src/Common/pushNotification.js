/* global fetch */

// Huawei Quick App uses @service.push (not @system.push)
let push = null;
let request = null;

try {
  // Try to import push service - will work in Quick App environment
  push = require('@service.push');
  console.log('✅ Push service imported successfully');
} catch (e) {
  console.warn('⚠️ @service.push not available:', e.message);
  push = null;
}

try {
  // Try to import request service
  request = require('@system.request');
  console.log('✅ Request service imported successfully');
} catch (e) {
  console.warn('⚠️ @system.request not available:', e.message);
  request = null;
}

function isHuaweiDevice() {
  return push !== null && typeof push !== 'undefined';
}

function requestPushPermission(cb) {
  if (!isHuaweiDevice()) {
    const err = new Error('Push service unavailable');
    console.error('❌ Push not available, calling callback with error');
    if (cb) cb(err);
    return;
  }
  
  try {
    if (push.requestPermission && typeof push.requestPermission === 'function') {
      console.log('📝 Requesting push permission...');
      push.requestPermission({
        success() {
          console.log('✅ Push permission granted');
          if (cb) cb(null);
        },
        fail(err) {
          console.error('❌ Push permission failed:', err);
          if (cb) cb(err);
        }
      });
    } else {
      console.log('⚠️ requestPermission not available, proceeding to register');
      if (cb) cb(null);
    }
  } catch (error) {
    console.error('❌ Error requesting permission:', error);
    if (cb) cb(error);
  }
}

function registerPush(cb) {
  if (!isHuaweiDevice()) {
    const err = new Error('Push service unavailable');
    console.error('❌ Push not available for registration');
    if (cb) cb(err);
    return;
  }
  
  try {
    console.log('🎫 Getting Huawei push token...');
    
    if (push.getToken && typeof push.getToken === 'function') {
      push.getToken({
        success: async (token) => {
          console.log('✅ Token received:', token.substring(0, 30) + '...');
          try {
            await postTokenToServer(token);
            if (cb) cb(null, token);
          } catch (err) {
            console.error('❌ Failed to post token:', err);
            if (cb) cb(err, token);
          }
        },
        fail: (err) => {
          console.error('❌ Failed to get token:', err);
          if (cb) cb(err);
        }
      });
    } else {
      console.warn('⚠️ getToken not available');
      if (cb) cb(new Error('getToken not available'));
    }
  } catch (error) {
    console.error('❌ Error in registerPush:', error);
    if (cb) cb(error);
  }
}

async function postTokenToServer(token) {
  const API_URL = 'https://us-central1-websitey-9f8e4.cloudfunctions.net/saveHuaweiToken';
  
  if (typeof fetch === 'function') {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'huawei_quickapp' })
      });
      if (!res.ok) throw new Error('Server registration failed: ' + res.status);
      console.log('✅ Token posted to server');
      return res.json();
    } catch (err) {
      console.error('❌ Fetch failed:', err);
      throw err;
    }
  }

  return new Promise((resolve, reject) => {
    if (!request) {
      reject(new Error('Request service not available'));
      return;
    }
    
    request({
      url: API_URL,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { token, platform: 'huawei_quickapp' },
      success(response) {
        console.log('✅ Token posted to server via request');
        resolve(response);
      },
      fail(err) {
        console.error('❌ Request failed:', err);
        reject(err);
      }
    });
  });
}

function onMessage(handler) {
  if (!isHuaweiDevice()) {
    console.warn('⚠️ Push service not available for onMessage');
    return;
  }
  
  if (push.onMessage && typeof push.onMessage === 'function') {
    console.log('📨 Setting up push message listener');
    push.onMessage(handler);
  }
}

// Attach functions to globalThis for compatibility
if (typeof globalThis !== 'undefined') {
  globalThis.isHuaweiDevice = isHuaweiDevice;
  globalThis.requestPushPermission = requestPushPermission;
  globalThis.registerPush = registerPush;
  globalThis.onMessage = onMessage;
  console.log('✅ Push functions attached to globalThis');
}

// Also support CommonJS export style
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isHuaweiDevice,
    requestPushPermission,
    registerPush,
    onMessage
  };
}
