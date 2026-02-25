(function(){
                        
                        var createPageHandler = function() {
                            return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-access-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader/lib/index.js?presets[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\preset-env,targets=node 8&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-transform-modules-commonjs&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\fa-toolkit\\lib\\fa-compiler\\jsx-loader.js&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-class-properties&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/webview/main.ux":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-access-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader/lib/index.js?presets[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\preset-env,targets=node 8&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-transform-modules-commonjs&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\fa-toolkit\lib\fa-compiler\jsx-loader.js&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-class-properties&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/webview/main.ux ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports = function(module, exports, $app_require$){"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _system = _interopRequireDefault($app_require$("@app-module/system.prompt"));
var _system2 = _interopRequireDefault($app_require$("@app-module/system.fetch"));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
var _default = exports.default = {
  onInit() {
    console.log('🚀 Webview component initializing...');
    this.initializePush();
  },
  initializePush() {
    try {
      const requestPushPermission = globalThis.requestPushPermission;
      const registerPush = globalThis.registerPush;
      if (!requestPushPermission || !registerPush) {
        console.warn('⚠️ Push functions not available from globalThis, trying direct registration');
        this.tryDirectRegistration();
        return;
      }
      console.log('📝 Requesting push permission...');
      requestPushPermission(err => {
        if (err) {
          console.warn('⚠️ Push permission request error:', err.message);
          this.performRegistration(registerPush);
        } else {
          console.log('✅ Permission granted, proceeding to register');
          this.performRegistration(registerPush);
        }
      });
    } catch (error) {
      console.error('❌ Error initializing push:', error);
    }
  },
  performRegistration(registerPush) {
    try {
      registerPush((err, token) => {
        if (!err && token) {
          console.log('🎫 Token received:', token.substring(0, 30) + '...');
          this.postTokenToWeb(token);
        } else {
          console.warn('⚠️ Registration failed or unavailable:', (err === null || err === void 0 ? void 0 : err.message) || 'unknown error');
          console.log('ℹ️ Push notifications may not work in emulator, but will work on real device');
        }
      });
    } catch (error) {
      console.error('❌ Error during registration:', error);
    }
  },
  tryDirectRegistration() {
    try {
      console.log('🔄 Attempting direct registration without permission...');
      const pushService = this.$service && this.$service.push;
      if (pushService && pushService.getToken && typeof pushService.getToken === 'function') {
        pushService.getToken({
          success: token => {
            console.log('🎫 Direct registration successful:', token.substring(0, 30) + '...');
            this.postTokenToWeb(token);
          },
          fail: err => {
            console.warn('⚠️ Direct registration failed:', err);
          }
        });
      }
    } catch (error) {
      console.error('❌ Direct registration error:', error);
    }
  },
  postTokenToWeb(token) {
    const web = this.$element('siteWeb');
    if (web && web.postMessage) {
      console.log('📤 Posting token to web component');
      web.postMessage(JSON.stringify({
        type: 'pushToken',
        token
      }));
    } else {
      console.warn('⚠️ Web element not available');
    }
  },
  onWebMessage(event) {
    let raw = event && (event.data || event.detail && event.detail.data) ? event.data || event.detail.data : null;
    if (!raw) {
      return;
    }
    let payload = raw;
    if (typeof raw === 'string') {
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        payload = {
          body: raw
        };
      }
    }
    if (payload.type === 'notify') {
      const message = payload.body || payload.title || 'Notification';
      _system.default.showToast({
        message,
        duration: 3000
      });
      return;
    }
    if (payload.type === 'requestPush') {
      global.registerPush((err, token) => {
        const web = this.$element('siteWeb');
        const resp = {
          type: 'pushTokenResponse',
          error: err ? err.message || err : null,
          token: token || null
        };
        web && web.postMessage && web.postMessage(JSON.stringify(resp));
      });
      return;
    }
    console.log('web message', payload);
  }
};
var accessors = ['public', 'protected', 'private'];
var moduleOwn = exports.default || module.exports;
var accessor = accessors.some(function (acc) {
  return moduleOwn[acc];
});
if (moduleOwn.data && accessor) {
  throw new Error('For VM objects, attribute data must not coexist with public, protected, or private. Please replace data with public.');
} else if (!moduleOwn.data) {
  moduleOwn._descriptor = {};
  moduleOwn.data = {};
  accessors.forEach(function (acc) {
    var accessType = typeof moduleOwn[acc];
    if (accessType === 'object') {
      moduleOwn.data = Object.assign(moduleOwn.data, moduleOwn[acc]);
      for (var name in moduleOwn[acc]) {
        moduleOwn._descriptor[name] = {
          access: acc
        };
      }
    } else if (accessType === 'function') {
      console.warn('For VM objects, attribute ' + acc + ' value must not be a function. Change the value to an object.');
    }
  });
}}

/***/ }),

/***/ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-style-loader.js?index=0&type=styles&resourcePath=c:\\Users\\josep\\Desktop\\copy-of-2026-back-up-02\\huawei-quickapp\\src\\webview\\main.ux!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=styles&resourcePath=c:\\Users\\josep\\Desktop\\copy-of-2026-back-up-02\\huawei-quickapp\\src\\webview\\main.ux!./src/webview/main.ux":
/*!****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-style-loader.js?index=0&type=styles&resourcePath=c:\Users\josep\Desktop\copy-of-2026-back-up-02\huawei-quickapp\src\webview\main.ux!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=styles&resourcePath=c:\Users\josep\Desktop\copy-of-2026-back-up-02\huawei-quickapp\src\webview\main.ux!./src/webview/main.ux ***!
  \****************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports={
  ".doc-page": {
    "flexDirection": "column",
    "flex": 1
  },
  "#siteWeb": {
    "flex": 1
  }
}

/***/ }),

/***/ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-template-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=templates!./src/webview/main.ux":
/*!**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-template-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=templates!./src/webview/main.ux ***!
  \**************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

module.exports={
  "type": "div",
  "attr": {},
  "classList": [
    "doc-page"
  ],
  "children": [
    {
      "type": "web",
      "attr": {
        "src": "https://app.educater.co.za",
        "id": "siteWeb"
      },
      "id": "siteWeb",
      "events": {
        "message": "onWebMessage"
      }
    }
  ]
}

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
/*!*****************************!*\
  !*** ./src/webview/main.ux ***!
  \*****************************/
var $app_template$ = __webpack_require__(/*! !!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-template-loader.js!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=templates!./main.ux */ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-template-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=templates!./src/webview/main.ux")
var $app_style$ = __webpack_require__(/*! !!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-style-loader.js?index=0&type=styles&resourcePath=c:\Users\josep\Desktop\copy-of-2026-back-up-02\huawei-quickapp\src\webview\main.ux!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=styles&resourcePath=c:\Users\josep\Desktop\copy-of-2026-back-up-02\huawei-quickapp\src\webview\main.ux!./main.ux */ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-style-loader.js?index=0&type=styles&resourcePath=c:\\Users\\josep\\Desktop\\copy-of-2026-back-up-02\\huawei-quickapp\\src\\webview\\main.ux!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=styles&resourcePath=c:\\Users\\josep\\Desktop\\copy-of-2026-back-up-02\\huawei-quickapp\\src\\webview\\main.ux!./src/webview/main.ux")
var $app_script$ = __webpack_require__(/*! !!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-access-loader.js!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader?presets[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\preset-env,targets=node 8&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-transform-modules-commonjs&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\fa-toolkit\lib\fa-compiler\jsx-loader.js&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-class-properties&plugins[]=c:\Program Files\Huawei QuickApp IDE\resources\app\extensions\deveco-debug\node_modules\@babel\plugin-proposal-object-rest-spread&comments=false!../../../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./main.ux */ "../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-script-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-access-loader.js!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/babel-loader/lib/index.js?presets[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\preset-env,targets=node 8&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-transform-modules-commonjs&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\fa-toolkit\\lib\\fa-compiler\\jsx-loader.js&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-class-properties&plugins[]=c:\\Program Files\\Huawei QuickApp IDE\\resources\\app\\extensions\\deveco-debug\\node_modules\\@babel\\plugin-proposal-object-rest-spread&comments=false!../../../../../Program Files/Huawei QuickApp IDE/resources/app/extensions/deveco-debug/node_modules/fa-toolkit/lib/fa-compiler/fa-fragment-loader.js?index=0&type=scripts!./src/webview/main.ux")

$app_define$('@app-component/main', [], function($app_require$, $app_exports$, $app_module$){
     $app_script$($app_module$, $app_exports$, $app_require$)
     if ($app_exports$.__esModule && $app_exports$.default) {
            $app_module$.exports = $app_exports$.default
        }
     $app_module$.exports.template = $app_template$
     $app_module$.exports.style = $app_style$
})

$app_bootstrap$('@app-component/main',{ packagerName:'fa-toolkit', packagerVersion: '14.0.1-Stable.300'})
})();

/******/ })()
;   };
                        if (typeof window === "undefined") {
                            return createPageHandler();
                        }
                        else {
                            window.createPageHandler = createPageHandler
                        }
                    })();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRcXHdlYnZpZXdcXG1haW4uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBaUJBO0FBQ0E7QUFBQTtBQUFBO0FBR0E7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vemEuY28uZWR1Y2F0ZXIuYXBwL3NyYy93ZWJ2aWV3L2M6XFxVc2Vyc1xcam9zZXBcXERlc2t0b3BcXGNvcHktb2YtMjAyNi1iYWNrLXVwLTAyXFxodWF3ZWktcXVpY2thcHBcXHNyY1xcd2Vidmlld1xcbWFpbi51eCIsIndlYnBhY2s6Ly96YS5jby5lZHVjYXRlci5hcHAvLi9zcmMvd2Vidmlldy9tYWluLnV4P2YzNGEiLCJ3ZWJwYWNrOi8vemEuY28uZWR1Y2F0ZXIuYXBwLy4vc3JjL3dlYnZpZXcvbWFpbi51eD8wMmVjIiwid2VicGFjazovL3phLmNvLmVkdWNhdGVyLmFwcC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly96YS5jby5lZHVjYXRlci5hcHAvLi9zcmMvd2Vidmlldy9tYWluLnV4Il0sInNvdXJjZXNDb250ZW50IjpbIjx0ZW1wbGF0ZT5cclxuICA8ZGl2IGNsYXNzPVwiZG9jLXBhZ2VcIj5cclxuICAgIDx3ZWIgc3JjPVwiaHR0cHM6Ly9hcHAuZWR1Y2F0ZXIuY28uemFcIiBpZD1cInNpdGVXZWJcIiBvbm1lc3NhZ2U9XCJvbldlYk1lc3NhZ2VcIj48L3dlYj5cclxuICA8L2Rpdj5cclxuPC90ZW1wbGF0ZT5cclxuXHJcbjxzdHlsZT5cclxuICAuZG9jLXBhZ2Uge1xyXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICAgIGZsZXg6IDE7XHJcbiAgfVxyXG4gICNzaXRlV2ViIHtcclxuICAgIGZsZXg6IDE7XHJcbiAgfVxyXG48L3N0eWxlPlxyXG5cclxuPHNjcmlwdD5cclxuaW1wb3J0IHByb21wdCBmcm9tICdAc3lzdGVtLnByb21wdCdcclxuaW1wb3J0IGZldGNoIGZyb20gJ0BzeXN0ZW0uZmV0Y2gnXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgb25Jbml0KCkge1xyXG4gICAgY29uc29sZS5sb2coJ/CfmoAgV2VidmlldyBjb21wb25lbnQgaW5pdGlhbGl6aW5nLi4uJyk7XHJcbiAgICAvLyBhc2sgcGVybWlzc2lvbiBhbmQgcmVnaXN0ZXIgZm9yIHB1c2g7IHRva2VuIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoZSB3ZWIgcGFnZVxyXG4gICAgdGhpcy5pbml0aWFsaXplUHVzaCgpO1xyXG4gIH0sXHJcblxyXG4gIGluaXRpYWxpemVQdXNoKCkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgLy8gQWNjZXNzIHB1c2ggZnVuY3Rpb25zIGZyb20gZ2xvYmFsVGhpcyAoc2V0IHVwIGJ5IC4uL2NvbW1vbi9wdXNoTm90aWZpY2F0aW9uKVxyXG4gICAgICBjb25zdCByZXF1ZXN0UHVzaFBlcm1pc3Npb24gPSBnbG9iYWxUaGlzLnJlcXVlc3RQdXNoUGVybWlzc2lvbjtcclxuICAgICAgY29uc3QgcmVnaXN0ZXJQdXNoID0gZ2xvYmFsVGhpcy5yZWdpc3RlclB1c2g7XHJcblxyXG4gICAgICBpZiAoIXJlcXVlc3RQdXNoUGVybWlzc2lvbiB8fCAhcmVnaXN0ZXJQdXNoKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKCfimqDvuI8gUHVzaCBmdW5jdGlvbnMgbm90IGF2YWlsYWJsZSBmcm9tIGdsb2JhbFRoaXMsIHRyeWluZyBkaXJlY3QgcmVnaXN0cmF0aW9uJyk7XHJcbiAgICAgICAgdGhpcy50cnlEaXJlY3RSZWdpc3RyYXRpb24oKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn5OdIFJlcXVlc3RpbmcgcHVzaCBwZXJtaXNzaW9uLi4uJyk7XHJcbiAgICAgIHJlcXVlc3RQdXNoUGVybWlzc2lvbigoZXJyKSA9PiB7XHJcbiAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgY29uc29sZS53YXJuKCfimqDvuI8gUHVzaCBwZXJtaXNzaW9uIHJlcXVlc3QgZXJyb3I6JywgZXJyLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgLy8gVHJ5IHRvIHJlZ2lzdGVyIGFueXdheSB3aXRob3V0IGV4cGxpY2l0IHBlcm1pc3Npb25cclxuICAgICAgICAgIHRoaXMucGVyZm9ybVJlZ2lzdHJhdGlvbihyZWdpc3RlclB1c2gpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn4pyFIFBlcm1pc3Npb24gZ3JhbnRlZCwgcHJvY2VlZGluZyB0byByZWdpc3RlcicpO1xyXG4gICAgICAgICAgdGhpcy5wZXJmb3JtUmVnaXN0cmF0aW9uKHJlZ2lzdGVyUHVzaCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ+KdjCBFcnJvciBpbml0aWFsaXppbmcgcHVzaDonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcGVyZm9ybVJlZ2lzdHJhdGlvbihyZWdpc3RlclB1c2gpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIHJlZ2lzdGVyUHVzaCgoZXJyLCB0b2tlbikgPT4ge1xyXG4gICAgICAgIGlmICghZXJyICYmIHRva2VuKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn8J+OqyBUb2tlbiByZWNlaXZlZDonLCB0b2tlbi5zdWJzdHJpbmcoMCwgMzApICsgJy4uLicpO1xyXG4gICAgICAgICAgdGhpcy5wb3N0VG9rZW5Ub1dlYih0b2tlbik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUud2Fybign4pqg77iPIFJlZ2lzdHJhdGlvbiBmYWlsZWQgb3IgdW5hdmFpbGFibGU6JywgZXJyPy5tZXNzYWdlIHx8ICd1bmtub3duIGVycm9yJyk7XHJcbiAgICAgICAgICAvLyBQdXNoIG1heSBub3QgYmUgYXZhaWxhYmxlIGluIHRlc3QgZW52aXJvbm1lbnQgLSB0aGlzIGlzIE9LXHJcbiAgICAgICAgICBjb25zb2xlLmxvZygn4oS577iPIFB1c2ggbm90aWZpY2F0aW9ucyBtYXkgbm90IHdvcmsgaW4gZW11bGF0b3IsIGJ1dCB3aWxsIHdvcmsgb24gcmVhbCBkZXZpY2UnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcign4p2MIEVycm9yIGR1cmluZyByZWdpc3RyYXRpb246JywgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIHRyeURpcmVjdFJlZ2lzdHJhdGlvbigpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn5SEIEF0dGVtcHRpbmcgZGlyZWN0IHJlZ2lzdHJhdGlvbiB3aXRob3V0IHBlcm1pc3Npb24uLi4nKTtcclxuICAgICAgLy8gVHJ5IGFjY2Vzc2luZyBwdXNoIHNlcnZpY2UgZGlyZWN0bHlcclxuICAgICAgY29uc3QgcHVzaFNlcnZpY2UgPSB0aGlzLiRzZXJ2aWNlICYmIHRoaXMuJHNlcnZpY2UucHVzaDtcclxuICAgICAgaWYgKHB1c2hTZXJ2aWNlICYmIHB1c2hTZXJ2aWNlLmdldFRva2VuICYmIHR5cGVvZiBwdXNoU2VydmljZS5nZXRUb2tlbiA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgIHB1c2hTZXJ2aWNlLmdldFRva2VuKHtcclxuICAgICAgICAgIHN1Y2Nlc3M6ICh0b2tlbikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygn8J+OqyBEaXJlY3QgcmVnaXN0cmF0aW9uIHN1Y2Nlc3NmdWw6JywgdG9rZW4uc3Vic3RyaW5nKDAsIDMwKSArICcuLi4nKTtcclxuICAgICAgICAgICAgdGhpcy5wb3N0VG9rZW5Ub1dlYih0b2tlbik7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZmFpbDogKGVycikgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ+KaoO+4jyBEaXJlY3QgcmVnaXN0cmF0aW9uIGZhaWxlZDonLCBlcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgRGlyZWN0IHJlZ2lzdHJhdGlvbiBlcnJvcjonLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcG9zdFRva2VuVG9XZWIodG9rZW4pIHtcclxuICAgIGNvbnN0IHdlYiA9IHRoaXMuJGVsZW1lbnQoJ3NpdGVXZWInKTtcclxuICAgIGlmICh3ZWIgJiYgd2ViLnBvc3RNZXNzYWdlKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKCfwn5OkIFBvc3RpbmcgdG9rZW4gdG8gd2ViIGNvbXBvbmVudCcpO1xyXG4gICAgICB3ZWIucG9zdE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiAncHVzaFRva2VuJywgdG9rZW4gfSkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS53YXJuKCfimqDvuI8gV2ViIGVsZW1lbnQgbm90IGF2YWlsYWJsZScpO1xyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIG9uV2ViTWVzc2FnZShldmVudCkge1xyXG4gICAgbGV0IHJhdyA9IGV2ZW50ICYmIChldmVudC5kYXRhIHx8IChldmVudC5kZXRhaWwgJiYgZXZlbnQuZGV0YWlsLmRhdGEpKSA/IChldmVudC5kYXRhIHx8IGV2ZW50LmRldGFpbC5kYXRhKSA6IG51bGxcclxuICAgIGlmICghcmF3KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgbGV0IHBheWxvYWQgPSByYXdcclxuICAgIGlmICh0eXBlb2YgcmF3ID09PSAnc3RyaW5nJykge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHBheWxvYWQgPSBKU09OLnBhcnNlKHJhdylcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHBheWxvYWQgPSB7IGJvZHk6IHJhdyB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAocGF5bG9hZC50eXBlID09PSAnbm90aWZ5Jykge1xyXG4gICAgICBjb25zdCBtZXNzYWdlID0gcGF5bG9hZC5ib2R5IHx8IHBheWxvYWQudGl0bGUgfHwgJ05vdGlmaWNhdGlvbidcclxuICAgICAgcHJvbXB0LnNob3dUb2FzdCh7IG1lc3NhZ2UsIGR1cmF0aW9uOiAzMDAwIH0pXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIGlmIChwYXlsb2FkLnR5cGUgPT09ICdyZXF1ZXN0UHVzaCcpIHtcclxuICAgICAgLy8gd2ViIGFza3MgZm9yIGEgZnJlc2ggdG9rZW5cclxuICAgICAgcmVnaXN0ZXJQdXNoKChlcnIsIHRva2VuKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgd2ViID0gdGhpcy4kZWxlbWVudCgnc2l0ZVdlYicpXHJcbiAgICAgICAgY29uc3QgcmVzcCA9IHsgdHlwZTogJ3B1c2hUb2tlblJlc3BvbnNlJywgZXJyb3I6IGVyciA/IChlcnIubWVzc2FnZSB8fCBlcnIpIDogbnVsbCwgdG9rZW46IHRva2VuIHx8IG51bGwgfVxyXG4gICAgICAgIHdlYiAmJiB3ZWIucG9zdE1lc3NhZ2UgJiYgd2ViLnBvc3RNZXNzYWdlKEpTT04uc3RyaW5naWZ5KHJlc3ApKVxyXG4gICAgICB9KVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBjb25zb2xlLmxvZygnd2ViIG1lc3NhZ2UnLCBwYXlsb2FkKVxyXG4gIH1cclxufVxyXG48L3NjcmlwdD5cclxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIi5kb2MtcGFnZVwiOiB7XG4gICAgXCJmbGV4RGlyZWN0aW9uXCI6IFwiY29sdW1uXCIsXG4gICAgXCJmbGV4XCI6IDFcbiAgfSxcbiAgXCIjc2l0ZVdlYlwiOiB7XG4gICAgXCJmbGV4XCI6IDFcbiAgfVxufSIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJ0eXBlXCI6IFwiZGl2XCIsXG4gIFwiYXR0clwiOiB7fSxcbiAgXCJjbGFzc0xpc3RcIjogW1xuICAgIFwiZG9jLXBhZ2VcIlxuICBdLFxuICBcImNoaWxkcmVuXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJ3ZWJcIixcbiAgICAgIFwiYXR0clwiOiB7XG4gICAgICAgIFwic3JjXCI6IFwiaHR0cHM6Ly9hcHAuZWR1Y2F0ZXIuY28uemFcIixcbiAgICAgICAgXCJpZFwiOiBcInNpdGVXZWJcIlxuICAgICAgfSxcbiAgICAgIFwiaWRcIjogXCJzaXRlV2ViXCIsXG4gICAgICBcImV2ZW50c1wiOiB7XG4gICAgICAgIFwibWVzc2FnZVwiOiBcIm9uV2ViTWVzc2FnZVwiXG4gICAgICB9XG4gICAgfVxuICBdXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsInZhciAkYXBwX3RlbXBsYXRlJCA9IHJlcXVpcmUoXCIhIS4uLy4uLy4uLy4uLy4uLy4uLy4uL1Byb2dyYW0gRmlsZXMvSHVhd2VpIFF1aWNrQXBwIElERS9yZXNvdXJjZXMvYXBwL2V4dGVuc2lvbnMvZGV2ZWNvLWRlYnVnL25vZGVfbW9kdWxlcy9mYS10b29sa2l0L2xpYi9mYS1jb21waWxlci9mYS10ZW1wbGF0ZS1sb2FkZXIuanMhLi4vLi4vLi4vLi4vLi4vLi4vLi4vUHJvZ3JhbSBGaWxlcy9IdWF3ZWkgUXVpY2tBcHAgSURFL3Jlc291cmNlcy9hcHAvZXh0ZW5zaW9ucy9kZXZlY28tZGVidWcvbm9kZV9tb2R1bGVzL2ZhLXRvb2xraXQvbGliL2ZhLWNvbXBpbGVyL2ZhLWZyYWdtZW50LWxvYWRlci5qcz9pbmRleD0wJnR5cGU9dGVtcGxhdGVzIS4vbWFpbi51eFwiKVxudmFyICRhcHBfc3R5bGUkID0gcmVxdWlyZShcIiEhLi4vLi4vLi4vLi4vLi4vLi4vLi4vUHJvZ3JhbSBGaWxlcy9IdWF3ZWkgUXVpY2tBcHAgSURFL3Jlc291cmNlcy9hcHAvZXh0ZW5zaW9ucy9kZXZlY28tZGVidWcvbm9kZV9tb2R1bGVzL2ZhLXRvb2xraXQvbGliL2ZhLWNvbXBpbGVyL2ZhLXN0eWxlLWxvYWRlci5qcz9pbmRleD0wJnR5cGU9c3R5bGVzJnJlc291cmNlUGF0aD1jOlxcXFxVc2Vyc1xcXFxqb3NlcFxcXFxEZXNrdG9wXFxcXGNvcHktb2YtMjAyNi1iYWNrLXVwLTAyXFxcXGh1YXdlaS1xdWlja2FwcFxcXFxzcmNcXFxcd2Vidmlld1xcXFxtYWluLnV4IS4uLy4uLy4uLy4uLy4uLy4uLy4uL1Byb2dyYW0gRmlsZXMvSHVhd2VpIFF1aWNrQXBwIElERS9yZXNvdXJjZXMvYXBwL2V4dGVuc2lvbnMvZGV2ZWNvLWRlYnVnL25vZGVfbW9kdWxlcy9mYS10b29sa2l0L2xpYi9mYS1jb21waWxlci9mYS1mcmFnbWVudC1sb2FkZXIuanM/aW5kZXg9MCZ0eXBlPXN0eWxlcyZyZXNvdXJjZVBhdGg9YzpcXFxcVXNlcnNcXFxcam9zZXBcXFxcRGVza3RvcFxcXFxjb3B5LW9mLTIwMjYtYmFjay11cC0wMlxcXFxodWF3ZWktcXVpY2thcHBcXFxcc3JjXFxcXHdlYnZpZXdcXFxcbWFpbi51eCEuL21haW4udXhcIilcbnZhciAkYXBwX3NjcmlwdCQgPSByZXF1aXJlKFwiISEuLi8uLi8uLi8uLi8uLi8uLi8uLi9Qcm9ncmFtIEZpbGVzL0h1YXdlaSBRdWlja0FwcCBJREUvcmVzb3VyY2VzL2FwcC9leHRlbnNpb25zL2RldmVjby1kZWJ1Zy9ub2RlX21vZHVsZXMvZmEtdG9vbGtpdC9saWIvZmEtY29tcGlsZXIvZmEtc2NyaXB0LWxvYWRlci5qcyEuLi8uLi8uLi8uLi8uLi8uLi8uLi9Qcm9ncmFtIEZpbGVzL0h1YXdlaSBRdWlja0FwcCBJREUvcmVzb3VyY2VzL2FwcC9leHRlbnNpb25zL2RldmVjby1kZWJ1Zy9ub2RlX21vZHVsZXMvZmEtdG9vbGtpdC9saWIvZmEtY29tcGlsZXIvZmEtYWNjZXNzLWxvYWRlci5qcyEuLi8uLi8uLi8uLi8uLi8uLi8uLi9Qcm9ncmFtIEZpbGVzL0h1YXdlaSBRdWlja0FwcCBJREUvcmVzb3VyY2VzL2FwcC9leHRlbnNpb25zL2RldmVjby1kZWJ1Zy9ub2RlX21vZHVsZXMvYmFiZWwtbG9hZGVyP3ByZXNldHNbXT1jOlxcXFxQcm9ncmFtIEZpbGVzXFxcXEh1YXdlaSBRdWlja0FwcCBJREVcXFxccmVzb3VyY2VzXFxcXGFwcFxcXFxleHRlbnNpb25zXFxcXGRldmVjby1kZWJ1Z1xcXFxub2RlX21vZHVsZXNcXFxcQGJhYmVsXFxcXHByZXNldC1lbnYsdGFyZ2V0cz1ub2RlIDgmcGx1Z2luc1tdPWM6XFxcXFByb2dyYW0gRmlsZXNcXFxcSHVhd2VpIFF1aWNrQXBwIElERVxcXFxyZXNvdXJjZXNcXFxcYXBwXFxcXGV4dGVuc2lvbnNcXFxcZGV2ZWNvLWRlYnVnXFxcXG5vZGVfbW9kdWxlc1xcXFxAYmFiZWxcXFxccGx1Z2luLXRyYW5zZm9ybS1tb2R1bGVzLWNvbW1vbmpzJnBsdWdpbnNbXT1jOlxcXFxQcm9ncmFtIEZpbGVzXFxcXEh1YXdlaSBRdWlja0FwcCBJREVcXFxccmVzb3VyY2VzXFxcXGFwcFxcXFxleHRlbnNpb25zXFxcXGRldmVjby1kZWJ1Z1xcXFxub2RlX21vZHVsZXNcXFxcZmEtdG9vbGtpdFxcXFxsaWJcXFxcZmEtY29tcGlsZXJcXFxcanN4LWxvYWRlci5qcyZwbHVnaW5zW109YzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxIdWF3ZWkgUXVpY2tBcHAgSURFXFxcXHJlc291cmNlc1xcXFxhcHBcXFxcZXh0ZW5zaW9uc1xcXFxkZXZlY28tZGVidWdcXFxcbm9kZV9tb2R1bGVzXFxcXEBiYWJlbFxcXFxwbHVnaW4tcHJvcG9zYWwtY2xhc3MtcHJvcGVydGllcyZwbHVnaW5zW109YzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxIdWF3ZWkgUXVpY2tBcHAgSURFXFxcXHJlc291cmNlc1xcXFxhcHBcXFxcZXh0ZW5zaW9uc1xcXFxkZXZlY28tZGVidWdcXFxcbm9kZV9tb2R1bGVzXFxcXEBiYWJlbFxcXFxwbHVnaW4tcHJvcG9zYWwtb2JqZWN0LXJlc3Qtc3ByZWFkJmNvbW1lbnRzPWZhbHNlIS4uLy4uLy4uLy4uLy4uLy4uLy4uL1Byb2dyYW0gRmlsZXMvSHVhd2VpIFF1aWNrQXBwIElERS9yZXNvdXJjZXMvYXBwL2V4dGVuc2lvbnMvZGV2ZWNvLWRlYnVnL25vZGVfbW9kdWxlcy9mYS10b29sa2l0L2xpYi9mYS1jb21waWxlci9mYS1mcmFnbWVudC1sb2FkZXIuanM/aW5kZXg9MCZ0eXBlPXNjcmlwdHMhLi9tYWluLnV4XCIpXG5cbiRhcHBfZGVmaW5lJCgnQGFwcC1jb21wb25lbnQvbWFpbicsIFtdLCBmdW5jdGlvbigkYXBwX3JlcXVpcmUkLCAkYXBwX2V4cG9ydHMkLCAkYXBwX21vZHVsZSQpe1xuICAgICAkYXBwX3NjcmlwdCQoJGFwcF9tb2R1bGUkLCAkYXBwX2V4cG9ydHMkLCAkYXBwX3JlcXVpcmUkKVxuICAgICBpZiAoJGFwcF9leHBvcnRzJC5fX2VzTW9kdWxlICYmICRhcHBfZXhwb3J0cyQuZGVmYXVsdCkge1xuICAgICAgICAgICAgJGFwcF9tb2R1bGUkLmV4cG9ydHMgPSAkYXBwX2V4cG9ydHMkLmRlZmF1bHRcbiAgICAgICAgfVxuICAgICAkYXBwX21vZHVsZSQuZXhwb3J0cy50ZW1wbGF0ZSA9ICRhcHBfdGVtcGxhdGUkXG4gICAgICRhcHBfbW9kdWxlJC5leHBvcnRzLnN0eWxlID0gJGFwcF9zdHlsZSRcbn0pXG5cbiRhcHBfYm9vdHN0cmFwJCgnQGFwcC1jb21wb25lbnQvbWFpbicseyBwYWNrYWdlck5hbWU6J2ZhLXRvb2xraXQnLCBwYWNrYWdlclZlcnNpb246ICcxNC4wLjEtU3RhYmxlLjMwMCd9KSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==