"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testHuaweiPush = exports.sendBroadcastNotification = exports.sendHuaweiPushOnNotification = exports.saveHuaweiToken = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();
// ============================================================================
// CONFIGURATION - YOUR HUAWEI CREDENTIALS FROM .env
// ============================================================================
// Huawei credentials - stored securely in Firebase config
const HUAWEI_CLIENT_ID = "1877714599654983488";
const HUAWEI_CLIENT_SECRET = "F456383B87DC6B7A3064A793ADB9E9BDB6903C3F2DE0B1FB63D91736E9F3C459";
// Huawei App ID for Educater Quick App
const HUAWEI_APP_ID = "116819743";
// Huawei API endpoints
const HUAWEI_TOKEN_URL = "https://oauth-login.cloud.huawei.com/oauth2/v3/token";
const HUAWEI_PUSH_URL = `https://push-api.cloud.huawei.com/v1/${HUAWEI_APP_ID}/messages:send`;
// ============================================================================
// HUAWEI AUTHENTICATION
// ============================================================================
/**
 * Get OAuth2 access token from Huawei
 * This token is required for all API calls to Huawei Push Kit
 */
async function getHuaweiAccessToken() {
    try {
        const response = await axios_1.default.post(HUAWEI_TOKEN_URL, {
            grant_type: "client_credentials",
            client_id: HUAWEI_CLIENT_ID,
            client_secret: HUAWEI_CLIENT_SECRET,
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (!response.data.access_token) {
            throw new Error("No access token in Huawei response");
        }
        console.log("✅ Huawei access token obtained successfully");
        return response.data.access_token;
    }
    catch (error) {
        console.error("❌ Failed to get Huawei access token:", error);
        throw new Error(`Huawei authentication failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Send push notification to Huawei Quick App via Huawei Push Kit
 */
async function sendHuaweiPushNotification(huaweiToken, notification, accessToken) {
    try {
        // Build the payload
        const payload = {
            validate_only: false,
            message: {
                android: {
                    notification: {
                        title: notification.title,
                        body: notification.body,
                        icon: notification.icon || "/educater-icon-192.png",
                        clickAction: {
                            type: 1,
                            intent: notification.url || "/",
                        },
                    },
                    // CRITICAL: fast_app_target: 1 targets the Quick App environment
                    fast_app_target: 1,
                    // Optional: pass additional data
                    data: JSON.stringify({
                        url: notification.url || "/",
                        timestamp: new Date().toISOString(),
                    }),
                },
                token: [huaweiToken],
            },
        };
        console.log("📤 Sending push to Huawei Quick App:", {
            token: huaweiToken.substring(0, 20) + "...",
            title: notification.title,
            fast_app_target: 1,
        });
        const response = await axios_1.default.post(HUAWEI_PUSH_URL, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data.code === "80000000" || response.data.msg === "success") {
            console.log("✅ Push notification sent successfully to Quick App:", response.data);
        }
        else {
            console.warn("⚠️ Unexpected response from Huawei:", response.data);
        }
    }
    catch (error) {
        console.error("❌ Failed to send push notification:", error);
        throw new Error(`Failed to send notification: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Fetch user's Huawei token from Firestore
 */
async function getUserHuaweiToken(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
            console.warn(`⚠️ User document not found: ${userId}`);
            return null;
        }
        const huaweiToken = userDoc.data()?.huawei_token;
        if (!huaweiToken) {
            console.warn(`⚠️ No Huawei token found for user: ${userId}`);
            return null;
        }
        console.log(`✅ Huawei token retrieved for user: ${userId}`);
        return huaweiToken;
    }
    catch (error) {
        console.error(`❌ Error fetching Huawei token for user ${userId}:`, error);
        throw error;
    }
}
// ============================================================================
// CLOUD FUNCTION: SAVE HUAWEI TOKEN
// ============================================================================
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
exports.saveHuaweiToken = functions
    .region("us-central1")
    .https.onRequest(async (req, res) => {
    // Enable CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    try {
        const { regId, platform, deviceInfo } = req.body;
        if (!regId) {
            res.status(400).json({ error: "Missing regId" });
            return;
        }
        console.log("📱 Saving Huawei token:", {
            regId: regId.substring(0, 20) + "...",
            platform,
            timestamp: new Date().toISOString(),
        });
        // For now, we'll associate with an anonymous user
        // In production, get userId from authentication token
        const userId = req.query.userId || "anonymous";
        // Save to Firestore
        const tokenData = {
            huawei_token: regId,
            platform: platform || "huawei_quickapp",
            saved_at: admin.firestore.FieldValue.serverTimestamp(),
            device_info: deviceInfo || {},
        };
        // Update user document with Huawei token
        await db.collection("users").doc(userId).set(tokenData, { merge: true });
        console.log(`✅ Token saved for user: ${userId}`);
        res.json({
            success: true,
            message: "Huawei token saved successfully",
            userId,
        });
    }
    catch (error) {
        console.error("❌ Error saving Huawei token:", error);
        res.status(500).json({
            error: "Failed to save token",
            details: error instanceof Error ? error.message : String(error),
        });
    }
});
// ============================================================================
// CLOUD FUNCTION: SEND PUSH ON NOTIFICATION CREATED
// ============================================================================
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
exports.sendHuaweiPushOnNotification = functions
    .region("us-central1") // Using supported region
    .firestore.document("notifications/{docId}")
    .onCreate(async (snap, context) => {
    const notificationData = snap.data();
    const docId = context.params.docId;
    console.log(`📬 Processing notification ${docId}:`, notificationData);
    try {
        // Validate required fields
        if (!notificationData.userId) {
            throw new Error("Missing required field: userId");
        }
        if (!notificationData.title || !notificationData.body) {
            throw new Error("Missing required fields: title or body");
        }
        // Step 1: Get Huawei access token
        const accessToken = await getHuaweiAccessToken();
        // Step 2: Fetch user's Huawei token
        const huaweiToken = await getUserHuaweiToken(notificationData.userId);
        if (!huaweiToken) {
            console.warn(`⚠️ Skipping notification: No Huawei token for user ${notificationData.userId}`);
            // Update notification document with status
            await snap.ref.update({
                status: "skipped",
                reason: "no_huawei_token",
                processedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
        }
        // Step 3: Send push notification
        await sendHuaweiPushNotification(huaweiToken, notificationData, accessToken);
        // Step 4: Update notification document with success status
        await snap.ref.update({
            status: "sent",
            sentAt: admin.firestore.FieldValue.serverTimestamp(),
            huaweiResponse: "quick_app_targeted",
        });
        console.log(`✅ Notification ${docId} processed successfully`);
    }
    catch (error) {
        console.error(`❌ Error processing notification ${docId}:`, error);
        // Update notification document with error status
        try {
            await snap.ref.update({
                status: "failed",
                error: error instanceof Error ? error.message : String(error),
                failedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
        catch (updateError) {
            console.error("Failed to update notification document:", updateError);
        }
        throw error;
    }
});
// ============================================================================
// OPTIONAL: BATCH SEND FUNCTION FOR BROADCASTING
// ============================================================================
/**
 * Cloud Function: Send notification to multiple users
 * Call this via: firebase functions:call sendBroadcastNotification --data='{"title":"Hello","body":"Test"}'
 */
exports.sendBroadcastNotification = functions
    .region("us-central1")
    .https.onCall(async (data, context) => {
    // Optional: Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be authenticated");
    }
    const { title, body, icon, url, userIds } = data;
    if (!title || !body) {
        throw new functions.https.HttpsError("invalid-argument", "Missing title or body");
    }
    try {
        const accessToken = await getHuaweiAccessToken();
        const results = {
            sent: 0,
            failed: 0,
            skipped: 0,
        };
        // Get list of userIds (all users if not specified)
        let targetUserIds = userIds || [];
        if (!targetUserIds.length) {
            const userDocs = await db.collection("users").get();
            targetUserIds = userDocs.docs.map((doc) => doc.id);
        }
        console.log(`📤 Sending broadcast to ${targetUserIds.length} users`);
        for (const userId of targetUserIds) {
            try {
                const huaweiToken = await getUserHuaweiToken(userId);
                if (!huaweiToken) {
                    results.skipped++;
                    continue;
                }
                await sendHuaweiPushNotification(huaweiToken, { userId, title, body, icon, url }, accessToken);
                results.sent++;
            }
            catch (error) {
                console.error(`Failed to send to user ${userId}:`, error);
                results.failed++;
            }
        }
        console.log("📊 Broadcast results:", results);
        return results;
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", `Broadcast failed: ${error instanceof Error ? error.message : String(error)}`);
    }
});
// ============================================================================
// OPTIONAL: HTTP ENDPOINT FOR TESTING
// ============================================================================
/**
 * HTTP endpoint to test Huawei Push
 * Call: POST https://your-region-project.cloudfunctions.net/testHuaweiPush
 * Body: { "userId": "user-id", "title": "Test", "body": "Test message" }
 */
exports.testHuaweiPush = functions
    .region("us-central1")
    .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
    }
    const { userId, title, body } = req.body;
    if (!userId || !title || !body) {
        res.status(400).json({
            error: "Missing required fields: userId, title, body",
        });
        return;
    }
    try {
        const accessToken = await getHuaweiAccessToken();
        const huaweiToken = await getUserHuaweiToken(userId);
        if (!huaweiToken) {
            res.status(404).json({
                error: `No Huawei token found for user: ${userId}`,
            });
            return;
        }
        await sendHuaweiPushNotification(huaweiToken, { userId, title, body }, accessToken);
        res.json({
            success: true,
            message: "Test notification sent to Quick App",
            userId,
        });
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
        });
    }
});
//# sourceMappingURL=index.js.map