(function(){
                        
                        var $app_define_wrap$ = $app_define_wrap$ || function() {}
                        var createAppHandler = function() {
                            return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/common/pushNotification.js":
/*!****************************************!*\
  !*** ./src/common/pushNotification.js ***!
  \****************************************/
/***/ ((module) => {

"use strict";


/* global fetch */

// Huawei Quick App uses @service.push (not @system.push)
let push = null;
let request = null;
try {
  // Try to import push service - will work in Quick App environment
  push = $app_require$('@app-module/service.push');
  console.log('✅ Push service imported successfully');
} catch (e) {
  console.warn('⚠️ @service.push not available:', e.message);
  push = null;
}
try {
  // Try to import request service
  request = $app_require$('@app-module/system.request');
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
        success: async token => {
          console.log('✅ Token received:', token.substring(0, 30) + '...');
          try {
            await postTokenToServer(token);
            if (cb) cb(null, token);
          } catch (err) {
            console.error('❌ Failed to post token:', err);
            if (cb) cb(err, token);
          }
        },
        fail: err => {
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
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          platform: 'huawei_quickapp'
        })
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
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        token,
        platform: 'huawei_quickapp'
      },
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
if ( true && module.exports) {
  module.exports = {
    isHuaweiDevice,
    requestPushPermission,
    registerPush,
    onMessage
  };
}

/***/ }),

/***/ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-app-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader/lib/index.js?presets[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\preset-env,targets=node 8&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-transform-modules-commonjs&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-class-properties&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/app.ux":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-app-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader/lib/index.js?presets[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\preset-env,targets=node 8&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-transform-modules-commonjs&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-class-properties&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/app.ux ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = function(module, exports, $app_require$){"use strict";

__webpack_require__(/*! ./common/pushNotification.js */ "./src/common/pushNotification.js");
module.exports = {
  onCreate() {
    console.info('✅ Application onCreate');
    console.log('📱 Push notification module initialized');
  },
  onDestroy() {
    console.info('Application onDestroy');
  }
};
(exports.default || module.exports).manifest = __webpack_require__(/*! !!../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-manifest-loader.js!./manifest.json */ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-manifest-loader.js!./src/manifest.json")
}

/***/ }),

/***/ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-manifest-loader.js!./src/manifest.json":
/*!********************************************************************************************************************************************************************************!*\
  !*** ../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-manifest-loader.js!./src/manifest.json ***!
  \********************************************************************************************************************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"package":"za.co.educater.app","name":"Educater.co.za","versionName":"1.0.0","versionCode":1,"icon":"/Common/icon-192.png","minPlatformVersion":1070,"features":[{"name":"system.prompt"},{"name":"system.push"},{"name":"system.request"},{"name":"service.push"},{"name":"system.fetch"},{"name":"system.webview"}],"config":{},"router":{"entry":"webview","pages":{"webview":{"component":"main","path":"https://app.educater.co.za/"}}},"display":{"menu":true,"orientation":"auto"},"versionType":"debug"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!********************!*\
  !*** ./src/app.ux ***!
  \********************/
var $app_script$ = __webpack_require__(/*! !!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-app-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader?presets[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\preset-env,targets=node 8&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-transform-modules-commonjs&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-class-properties&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/app.ux */ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-app-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader/lib/index.js?presets[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\preset-env,targets=node 8&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-transform-modules-commonjs&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-class-properties&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/app.ux")

$app_define$('@app-application/app', [], function($app_require$, $app_exports$, $app_module$){

        $app_script$($app_module$, $app_exports$, $app_require$)
        if ($app_exports$.__esModule && $app_exports$.default) {
            $app_module$.exports = $app_exports$.default;
        }
})
$app_bootstrap$('@app-application/app',{packagerName:'fa-toolkit', packagerVersion: '14.0.1-Stable.300'})
})();

/******/ })()
;   };
                        if (typeof window === "undefined") {
                            return createAppHandler();
                        }
                        else {
                            window.createAppHandler = createAppHandler
                        }
                    })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRcXGFwcC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7OztBQ3BLQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly96YS5jby5lZHVjYXRlci5hcHAvLi9zcmMvY29tbW9uL3B1c2hOb3RpZmljYXRpb24uanMiLCJ3ZWJwYWNrOi8vemEuY28uZWR1Y2F0ZXIuYXBwL3NyYy9jOlxcVXNlcnNcXGpvc2VwXFxEZXNrdG9wXFxjb3B5LW9mLTIwMjYtYmFjay11cC0wMlxcaHVhd2VpLXF1aWNrYXBwXFxzcmNcXGFwcC51eCIsIndlYnBhY2s6Ly96YS5jby5lZHVjYXRlci5hcHAvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vemEuY28uZWR1Y2F0ZXIuYXBwLy4vc3JjL2FwcC51eCJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxuLyogZ2xvYmFsIGZldGNoICovXG5cbi8vIEh1YXdlaSBRdWljayBBcHAgdXNlcyBAc2VydmljZS5wdXNoIChub3QgQHN5c3RlbS5wdXNoKVxubGV0IHB1c2ggPSBudWxsO1xubGV0IHJlcXVlc3QgPSBudWxsO1xudHJ5IHtcbiAgLy8gVHJ5IHRvIGltcG9ydCBwdXNoIHNlcnZpY2UgLSB3aWxsIHdvcmsgaW4gUXVpY2sgQXBwIGVudmlyb25tZW50XG4gIHB1c2ggPSAkYXBwX3JlcXVpcmUkKCdAYXBwLW1vZHVsZS9zZXJ2aWNlLnB1c2gnKTtcbiAgY29uc29sZS5sb2coJ+KchSBQdXNoIHNlcnZpY2UgaW1wb3J0ZWQgc3VjY2Vzc2Z1bGx5Jyk7XG59IGNhdGNoIChlKSB7XG4gIGNvbnNvbGUud2Fybign4pqg77iPIEBzZXJ2aWNlLnB1c2ggbm90IGF2YWlsYWJsZTonLCBlLm1lc3NhZ2UpO1xuICBwdXNoID0gbnVsbDtcbn1cbnRyeSB7XG4gIC8vIFRyeSB0byBpbXBvcnQgcmVxdWVzdCBzZXJ2aWNlXG4gIHJlcXVlc3QgPSAkYXBwX3JlcXVpcmUkKCdAYXBwLW1vZHVsZS9zeXN0ZW0ucmVxdWVzdCcpO1xuICBjb25zb2xlLmxvZygn4pyFIFJlcXVlc3Qgc2VydmljZSBpbXBvcnRlZCBzdWNjZXNzZnVsbHknKTtcbn0gY2F0Y2ggKGUpIHtcbiAgY29uc29sZS53YXJuKCfimqDvuI8gQHN5c3RlbS5yZXF1ZXN0IG5vdCBhdmFpbGFibGU6JywgZS5tZXNzYWdlKTtcbiAgcmVxdWVzdCA9IG51bGw7XG59XG5mdW5jdGlvbiBpc0h1YXdlaURldmljZSgpIHtcbiAgcmV0dXJuIHB1c2ggIT09IG51bGwgJiYgdHlwZW9mIHB1c2ggIT09ICd1bmRlZmluZWQnO1xufVxuZnVuY3Rpb24gcmVxdWVzdFB1c2hQZXJtaXNzaW9uKGNiKSB7XG4gIGlmICghaXNIdWF3ZWlEZXZpY2UoKSkge1xuICAgIGNvbnN0IGVyciA9IG5ldyBFcnJvcignUHVzaCBzZXJ2aWNlIHVuYXZhaWxhYmxlJyk7XG4gICAgY29uc29sZS5lcnJvcign4p2MIFB1c2ggbm90IGF2YWlsYWJsZSwgY2FsbGluZyBjYWxsYmFjayB3aXRoIGVycm9yJyk7XG4gICAgaWYgKGNiKSBjYihlcnIpO1xuICAgIHJldHVybjtcbiAgfVxuICB0cnkge1xuICAgIGlmIChwdXNoLnJlcXVlc3RQZXJtaXNzaW9uICYmIHR5cGVvZiBwdXNoLnJlcXVlc3RQZXJtaXNzaW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zb2xlLmxvZygn8J+TnSBSZXF1ZXN0aW5nIHB1c2ggcGVybWlzc2lvbi4uLicpO1xuICAgICAgcHVzaC5yZXF1ZXN0UGVybWlzc2lvbih7XG4gICAgICAgIHN1Y2Nlc3MoKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ+KchSBQdXNoIHBlcm1pc3Npb24gZ3JhbnRlZCcpO1xuICAgICAgICAgIGlmIChjYikgY2IobnVsbCk7XG4gICAgICAgIH0sXG4gICAgICAgIGZhaWwoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcign4p2MIFB1c2ggcGVybWlzc2lvbiBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgICBpZiAoY2IpIGNiKGVycik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygn4pqg77iPIHJlcXVlc3RQZXJtaXNzaW9uIG5vdCBhdmFpbGFibGUsIHByb2NlZWRpbmcgdG8gcmVnaXN0ZXInKTtcbiAgICAgIGlmIChjYikgY2IobnVsbCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvciByZXF1ZXN0aW5nIHBlcm1pc3Npb246JywgZXJyb3IpO1xuICAgIGlmIChjYikgY2IoZXJyb3IpO1xuICB9XG59XG5mdW5jdGlvbiByZWdpc3RlclB1c2goY2IpIHtcbiAgaWYgKCFpc0h1YXdlaURldmljZSgpKSB7XG4gICAgY29uc3QgZXJyID0gbmV3IEVycm9yKCdQdXNoIHNlcnZpY2UgdW5hdmFpbGFibGUnKTtcbiAgICBjb25zb2xlLmVycm9yKCfinYwgUHVzaCBub3QgYXZhaWxhYmxlIGZvciByZWdpc3RyYXRpb24nKTtcbiAgICBpZiAoY2IpIGNiKGVycik7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coJ/CfjqsgR2V0dGluZyBIdWF3ZWkgcHVzaCB0b2tlbi4uLicpO1xuICAgIGlmIChwdXNoLmdldFRva2VuICYmIHR5cGVvZiBwdXNoLmdldFRva2VuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBwdXNoLmdldFRva2VuKHtcbiAgICAgICAgc3VjY2VzczogYXN5bmMgdG9rZW4gPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCfinIUgVG9rZW4gcmVjZWl2ZWQ6JywgdG9rZW4uc3Vic3RyaW5nKDAsIDMwKSArICcuLi4nKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgcG9zdFRva2VuVG9TZXJ2ZXIodG9rZW4pO1xuICAgICAgICAgICAgaWYgKGNiKSBjYihudWxsLCB0b2tlbik7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCfinYwgRmFpbGVkIHRvIHBvc3QgdG9rZW46JywgZXJyKTtcbiAgICAgICAgICAgIGlmIChjYikgY2IoZXJyLCB0b2tlbik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmYWlsOiBlcnIgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBGYWlsZWQgdG8gZ2V0IHRva2VuOicsIGVycik7XG4gICAgICAgICAgaWYgKGNiKSBjYihlcnIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCfimqDvuI8gZ2V0VG9rZW4gbm90IGF2YWlsYWJsZScpO1xuICAgICAgaWYgKGNiKSBjYihuZXcgRXJyb3IoJ2dldFRva2VuIG5vdCBhdmFpbGFibGUnKSk7XG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvciBpbiByZWdpc3RlclB1c2g6JywgZXJyb3IpO1xuICAgIGlmIChjYikgY2IoZXJyb3IpO1xuICB9XG59XG5hc3luYyBmdW5jdGlvbiBwb3N0VG9rZW5Ub1NlcnZlcih0b2tlbikge1xuICBjb25zdCBBUElfVVJMID0gJ2h0dHBzOi8vdXMtY2VudHJhbDEtd2Vic2l0ZXktOWY4ZTQuY2xvdWRmdW5jdGlvbnMubmV0L3NhdmVIdWF3ZWlUb2tlbic7XG4gIGlmICh0eXBlb2YgZmV0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goQVBJX1VSTCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIHRva2VuLFxuICAgICAgICAgIHBsYXRmb3JtOiAnaHVhd2VpX3F1aWNrYXBwJ1xuICAgICAgICB9KVxuICAgICAgfSk7XG4gICAgICBpZiAoIXJlcy5vaykgdGhyb3cgbmV3IEVycm9yKCdTZXJ2ZXIgcmVnaXN0cmF0aW9uIGZhaWxlZDogJyArIHJlcy5zdGF0dXMpO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBUb2tlbiBwb3N0ZWQgdG8gc2VydmVyJyk7XG4gICAgICByZXR1cm4gcmVzLmpzb24oKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBGZXRjaCBmYWlsZWQ6JywgZXJyKTtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBpZiAoIXJlcXVlc3QpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3Qgc2VydmljZSBub3QgYXZhaWxhYmxlJykpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICByZXF1ZXN0KHtcbiAgICAgIHVybDogQVBJX1VSTCxcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgaGVhZGVyOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbidcbiAgICAgIH0sXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHRva2VuLFxuICAgICAgICBwbGF0Zm9ybTogJ2h1YXdlaV9xdWlja2FwcCdcbiAgICAgIH0sXG4gICAgICBzdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfinIUgVG9rZW4gcG9zdGVkIHRvIHNlcnZlciB2aWEgcmVxdWVzdCcpO1xuICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgIH0sXG4gICAgICBmYWlsKGVycikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCfinYwgUmVxdWVzdCBmYWlsZWQ6JywgZXJyKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuZnVuY3Rpb24gb25NZXNzYWdlKGhhbmRsZXIpIHtcbiAgaWYgKCFpc0h1YXdlaURldmljZSgpKSB7XG4gICAgY29uc29sZS53YXJuKCfimqDvuI8gUHVzaCBzZXJ2aWNlIG5vdCBhdmFpbGFibGUgZm9yIG9uTWVzc2FnZScpO1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAocHVzaC5vbk1lc3NhZ2UgJiYgdHlwZW9mIHB1c2gub25NZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5sb2coJ/Cfk6ggU2V0dGluZyB1cCBwdXNoIG1lc3NhZ2UgbGlzdGVuZXInKTtcbiAgICBwdXNoLm9uTWVzc2FnZShoYW5kbGVyKTtcbiAgfVxufVxuXG4vLyBBdHRhY2ggZnVuY3Rpb25zIHRvIGdsb2JhbFRoaXMgZm9yIGNvbXBhdGliaWxpdHlcbmlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgZ2xvYmFsVGhpcy5pc0h1YXdlaURldmljZSA9IGlzSHVhd2VpRGV2aWNlO1xuICBnbG9iYWxUaGlzLnJlcXVlc3RQdXNoUGVybWlzc2lvbiA9IHJlcXVlc3RQdXNoUGVybWlzc2lvbjtcbiAgZ2xvYmFsVGhpcy5yZWdpc3RlclB1c2ggPSByZWdpc3RlclB1c2g7XG4gIGdsb2JhbFRoaXMub25NZXNzYWdlID0gb25NZXNzYWdlO1xuICBjb25zb2xlLmxvZygn4pyFIFB1c2ggZnVuY3Rpb25zIGF0dGFjaGVkIHRvIGdsb2JhbFRoaXMnKTtcbn1cblxuLy8gQWxzbyBzdXBwb3J0IENvbW1vbkpTIGV4cG9ydCBzdHlsZVxuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIGlzSHVhd2VpRGV2aWNlLFxuICAgIHJlcXVlc3RQdXNoUGVybWlzc2lvbixcbiAgICByZWdpc3RlclB1c2gsXG4gICAgb25NZXNzYWdlXG4gIH07XG59IiwiPHNjcmlwdD5cclxuICAvLyBJbXBvcnQgcHVzaCBub3RpZmljYXRpb24gbW9kdWxlIHRvIHJlZ2lzdGVyIGZ1bmN0aW9ucyBvbiBnbG9iYWxUaGlzXHJcbiAgaW1wb3J0ICcuL2NvbW1vbi9wdXNoTm90aWZpY2F0aW9uLmpzJztcclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBvbkNyZWF0ZSgpIHtcclxuICAgICAgY29uc29sZS5pbmZvKCfinIUgQXBwbGljYXRpb24gb25DcmVhdGUnKTtcclxuICAgICAgY29uc29sZS5sb2coJ/Cfk7EgUHVzaCBub3RpZmljYXRpb24gbW9kdWxlIGluaXRpYWxpemVkJyk7XHJcbiAgICB9LFxyXG4gICAgb25EZXN0cm95KCkge1xyXG4gICAgICBjb25zb2xlLmluZm8oJ0FwcGxpY2F0aW9uIG9uRGVzdHJveScpO1xyXG4gICAgfVxyXG4gIH1cclxuPC9zY3JpcHQ+XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCJ2YXIgJGFwcF9zY3JpcHQkID0gcmVxdWlyZShcIiEhYzovUHJvZ3JhbSBGaWxlcy9IdWF3ZWkgUXVpY2tBcHAgSURFL3Jlc291cmNlcy9hcHAvZXh0ZW5zaW9ucy9kZXZlY28tZGVidWcvbm9kZV9tb2R1bGVzL2ZhLXRvb2xraXQvbGliL2ZhLWNvbXBpbGVyL2ZhLXNjcmlwdC1sb2FkZXIuanMhYzovUHJvZ3JhbSBGaWxlcy9IdWF3ZWkgUXVpY2tBcHAgSURFL3Jlc291cmNlcy9hcHAvZXh0ZW5zaW9ucy9kZXZlY28tZGVidWcvbm9kZV9tb2R1bGVzL2ZhLXRvb2xraXQvbGliL2ZhLWNvbXBpbGVyL2ZhLWFwcC1zY3JpcHQtbG9hZGVyLmpzIWM6L1Byb2dyYW0gRmlsZXMvSHVhd2VpIFF1aWNrQXBwIElERS9yZXNvdXJjZXMvYXBwL2V4dGVuc2lvbnMvZGV2ZWNvLWRlYnVnL25vZGVfbW9kdWxlcy9iYWJlbC1sb2FkZXI/cHJlc2V0c1tdPWM6XFxcXFByb2dyYW0gRmlsZXNcXFxcSHVhd2VpIFF1aWNrQXBwIElERVxcXFxyZXNvdXJjZXNcXFxcYXBwXFxcXGV4dGVuc2lvbnNcXFxcZGV2ZWNvLWRlYnVnXFxcXG5vZGVfbW9kdWxlc1xcXFxAYmFiZWxcXFxccHJlc2V0LWVudix0YXJnZXRzPW5vZGUgOCZwbHVnaW5zW109YzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxIdWF3ZWkgUXVpY2tBcHAgSURFXFxcXHJlc291cmNlc1xcXFxhcHBcXFxcZXh0ZW5zaW9uc1xcXFxkZXZlY28tZGVidWdcXFxcbm9kZV9tb2R1bGVzXFxcXEBiYWJlbFxcXFxwbHVnaW4tdHJhbnNmb3JtLW1vZHVsZXMtY29tbW9uanMmcGx1Z2luc1tdPWM6XFxcXFByb2dyYW0gRmlsZXNcXFxcSHVhd2VpIFF1aWNrQXBwIElERVxcXFxyZXNvdXJjZXNcXFxcYXBwXFxcXGV4dGVuc2lvbnNcXFxcZGV2ZWNvLWRlYnVnXFxcXG5vZGVfbW9kdWxlc1xcXFxAYmFiZWxcXFxccGx1Z2luLXByb3Bvc2FsLWNsYXNzLXByb3BlcnRpZXMmcGx1Z2luc1tdPWM6XFxcXFByb2dyYW0gRmlsZXNcXFxcSHVhd2VpIFF1aWNrQXBwIElERVxcXFxyZXNvdXJjZXNcXFxcYXBwXFxcXGV4dGVuc2lvbnNcXFxcZGV2ZWNvLWRlYnVnXFxcXG5vZGVfbW9kdWxlc1xcXFxAYmFiZWxcXFxccGx1Z2luLXByb3Bvc2FsLW9iamVjdC1yZXN0LXNwcmVhZCZjb21tZW50cz1mYWxzZSFjOi9Qcm9ncmFtIEZpbGVzL0h1YXdlaSBRdWlja0FwcCBJREUvcmVzb3VyY2VzL2FwcC9leHRlbnNpb25zL2RldmVjby1kZWJ1Zy9ub2RlX21vZHVsZXMvZmEtdG9vbGtpdC9saWIvZmEtY29tcGlsZXIvZmEtZnJhZ21lbnQtbG9hZGVyLmpzP2luZGV4PTAmdHlwZT1zY3JpcHRzIWM6L1VzZXJzL2pvc2VwL0Rlc2t0b3AvY29weS1vZi0yMDI2LWJhY2stdXAtMDIvaHVhd2VpLXF1aWNrYXBwL3NyYy9hcHAudXhcIilcblxyXG4kYXBwX2RlZmluZSQoJ0BhcHAtYXBwbGljYXRpb24vYXBwJywgW10sIGZ1bmN0aW9uKCRhcHBfcmVxdWlyZSQsICRhcHBfZXhwb3J0cyQsICRhcHBfbW9kdWxlJCl7XHJcblxuICAgICAgICAkYXBwX3NjcmlwdCQoJGFwcF9tb2R1bGUkLCAkYXBwX2V4cG9ydHMkLCAkYXBwX3JlcXVpcmUkKVxuICAgICAgICBpZiAoJGFwcF9leHBvcnRzJC5fX2VzTW9kdWxlICYmICRhcHBfZXhwb3J0cyQuZGVmYXVsdCkge1xuICAgICAgICAgICAgJGFwcF9tb2R1bGUkLmV4cG9ydHMgPSAkYXBwX2V4cG9ydHMkLmRlZmF1bHQ7XG4gICAgICAgIH1cclxufSlcclxuJGFwcF9ib290c3RyYXAkKCdAYXBwLWFwcGxpY2F0aW9uL2FwcCcse3BhY2thZ2VyTmFtZTonZmEtdG9vbGtpdCcsIHBhY2thZ2VyVmVyc2lvbjogJzE0LjAuMS1TdGFibGUuMzAwJ30pIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9