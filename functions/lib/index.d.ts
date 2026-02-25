import * as functions from "firebase-functions";
/**
 * HTTP Cloud Function to save Huawei regId (Push Token) to Firestore
 * Called from Quick App when device receives regId from Huawei Push Kit
 *
 * POST body:
 * {
 *   "regId": "AEn...",
 *   "platform": "huawei_quickapp",
 *   "deviceInfo": { "timestamp": "2025-02-04T..." }
 * }
 */
export declare const saveHuaweiToken: functions.HttpsFunction;
/**
 * Cloud Function: Triggered when a new document is created in 'notifications' collection
 * Sends push notification to Huawei Quick App
 *
 * Expected notification document structure:
 * {
 *   userId: "user-id",
 *   title: "Notification Title",
 *   body: "Notification Body",
 *   icon: "/icon.png",  // optional
 *   url: "/path/to/open",  // optional
 *   timestamp: FieldValue.serverTimestamp()
 * }
 */
export declare const sendHuaweiPushOnNotification: functions.CloudFunction<functions.firestore.QueryDocumentSnapshot>;
/**
 * Cloud Function: Send notification to multiple users
 * Call this via: firebase functions:call sendBroadcastNotification --data='{"title":"Hello","body":"Test"}'
 */
export declare const sendBroadcastNotification: functions.HttpsFunction & functions.Runnable<any>;
/**
 * HTTP endpoint to test Huawei Push
 * Call: POST https://your-region-project.cloudfunctions.net/testHuaweiPush
 * Body: { "userId": "user-id", "title": "Test", "body": "Test message" }
 */
export declare const testHuaweiPush: functions.HttpsFunction;
//# sourceMappingURL=index.d.ts.map