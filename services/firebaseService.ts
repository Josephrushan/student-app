// Modular Firebase SDK initialization and utility functions
import * as firebaseApp from "firebase/app";
import * as firebaseAuth from "firebase/auth";

import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  getDocs,
  getDoc,
  where,
  QueryConstraint
} from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";
import { getMessaging, getToken } from 'firebase/messaging';

const { initializeApp, deleteApp } = (firebaseApp as any);
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
} = (firebaseAuth as any);

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Set Firebase Auth persistence to LOCAL (survive browser restart)
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error('Failed to set persistence:', err);
});

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  getDoc,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signOut
};

export const createSecondaryAuthUser = async (email: string, password: string): Promise<any> => {
  const secondaryAppName = `secondary-app-${Date.now()}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  
  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    return userCredential;
  } finally {
    await deleteApp(secondaryApp);
  }
};

const sanitizeData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const sanitized: any = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      sanitized[key] = data[key];
    }
  });
  return sanitized;
};

export const saveDoc = async (collName: string, id: string, data: any) => {
  if (!id) throw new Error("Document ID is required");
  if (!collName) throw new Error("Collection name is required");
  
  const sanitized = sanitizeData(data);
  
  // Validate critical fields
  if (collName === 'assignments' && !data.schoolId) {
    throw new Error("schoolId is required for assignments");
  }
  if (collName === 'resources' && !data.schoolId) {
    throw new Error("schoolId is required for resources");
  }
  
  console.log(`Saving to Firestore: ${collName}/${id}`, sanitized);
  
  try {
    await setDoc(doc(db, collName, id), sanitized, { merge: true });
    console.log(`✅ Successfully saved ${collName}/${id}`);
  } catch (error: any) {
    const errorCode = error?.code || 'UNKNOWN';
    const errorMessage = error?.message || String(error);
    
    console.error(`❌ Firestore Save Error [${collName}/${id}]:`, error);
    console.error(`Error Code: ${errorCode}`);
    console.error(`Error Message: ${errorMessage}`);
    
    // Provide user-friendly error messages
    if (errorCode === 'permission-denied') {
      throw new Error(`Permission Denied: You don't have permission to save to ${collName}. Check your Firestore rules and user role.`);
    } else if (errorCode === 'unauthenticated') {
      throw new Error('Not authenticated. Please log in again.');
    } else if (errorCode === 'invalid-argument') {
      throw new Error(`Invalid data structure: ${errorMessage}`);
    } else {
      throw new Error(`Firestore Error: ${errorMessage}`);
    }
  }
};

export const patchDoc = async (collName: string, id: string, data: any) => {
  if (!id) throw new Error("Document ID is required");
  await updateDoc(doc(db, collName, id), sanitizeData(data));
};

export const removeDoc = async (collName: string, id: string) => {
  await deleteDoc(doc(db, collName, id));
};

export const listDocs = async (collName: string) => {
    try {
        const snap = await getDocs(collection(db, collName));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return [];
    }
};

export const uploadImage = async (path: string, data: string | File | Blob): Promise<string> => {
  if (!data) {
    console.warn('uploadImage called with no data');
    return '';
  }
  
  try {
    const sanitizedPath = path.replace(/^\//, '').replace(/\s+/g, '_');
    console.log(`Uploading to Storage: ${sanitizedPath}`);
    
    const storageRef = ref(storage, sanitizedPath);

    if (typeof data === 'string') {
        if (!data.startsWith('data:')) {
          console.log('Returning non-data-url string as-is:', data);
          return data;
        }
        console.log('Uploading data URL...');
        await uploadString(storageRef, data, 'data_url');
    } else {
        const fileSize = (data as Blob).size;
        const fileType = (data as Blob).type;
        console.log(`Uploading file: size=${fileSize}, type=${fileType}`);
        
        if (fileSize > 500_000_000) {
          throw new Error(`File too large (${(fileSize / 1_000_000).toFixed(1)}MB). Maximum is 500MB.`);
        }
        
        await uploadBytes(storageRef, data);
    }

    console.log('Getting download URL...');
    const downloadUrl = await getDownloadURL(storageRef);
    console.log(`✅ Upload successful: ${downloadUrl}`);
    return downloadUrl;
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error("❌ Image upload failed:", error);
    console.error("Error details:", errorMessage);
    
    // Check if it's an error we should rethrow
    if (error?.code === 'storage/unauthorized') {
      throw new Error('Storage Permission Denied: Check your Firebase Storage rules');
    } else if (error?.code === 'storage/unauthenticated') {
      throw new Error('Not authenticated for storage. Please log in again.');
    } else if (errorMessage.includes('too large')) {
      throw error;  // Rethrow file size error
    } else if (typeof data === 'string') {
      return data;  // Return original string on error if it was a string
    } else {
      throw new Error(`Upload failed: ${errorMessage}`);
    }
  }
};

export const setupListener = (
  collName: string, 
  callback: (data: any[]) => void, 
  sortField?: string, 
  order: 'asc' | 'desc' = 'desc',
  schoolId?: string
) => {
  const constraints: QueryConstraint[] = [];
  
  const tenantCollections = ['assignments', 'messages', 'alerts', 'yearbook', 'announcements', 'resources', 'events'];
  
  if (schoolId && tenantCollections.includes(collName)) {
    constraints.push(where('schoolId', '==', schoolId));
  } else if (tenantCollections.includes(collName) && !schoolId) {
    console.warn(`Listener for ${collName} started without schoolId. This may trigger security rule violations.`);
  }

  if (sortField) {
    constraints.push(orderBy(sortField, order));
  }
    
  const q = constraints.length > 0 
    ? query(collection(db, collName), ...constraints)
    : collection(db, collName);
    
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(items);
  }, (err: any) => {
    if (err.code === 'permission-denied') {
        console.warn(`Permission denied for ${collName}. SID: ${schoolId}. Ensure query matches security rules.`);
        // Return empty array instead of blocking on permission errors
        callback([]);
    } else if (err.message && err.message.includes('requires an index')) {
        console.error(`Index missing for ${collName}. Click the link in the console to create it.`);
        callback([]);
    } else {
        console.error(`Listener for ${collName} failed:`, err);
        callback([]);
    }
  });
};

let messaging: any = null;

const getMessagingInstance = () => {
  if (messaging === null) {
    try {
      messaging = getMessaging();
    } catch (err) {
      console.log('ℹ️ Firebase Cloud Messaging not available:', err);
      return null;
    }
  }
  return messaging;
};

export const requestNotificationPermission = async () => {
  try {
    const messagingInstance = getMessagingInstance();
    if (!messagingInstance) {
      console.log('ℹ️ Firebase Cloud Messaging is not available in this browser');
      return null;
    }

    const token = await getToken(messagingInstance, { vapidKey: process.env.VAPID_PUBLIC_KEY });
    console.log('Push notification token:', token);
    return token;
  } catch (error) {
    console.warn('⚠️ Error getting notification token:', error);
    return null;
  }
};

// Save push notification subscription to Firestore
export const savePushSubscription = async (userId: string, subscription: PushSubscription | any): Promise<void> => {
  try {
    console.log('🔔 [savePushSubscription] Starting subscription save with userId:', userId);
    
    if (!userId) {
      throw new Error('User ID is required to save subscription');
    }

    if (!subscription?.endpoint) {
      throw new Error('Invalid subscription object - no endpoint');
    }

    console.log('🔔 [savePushSubscription] Subscription endpoint:', subscription.endpoint.substring(0, 30) + '...');

    // The userId passed in should be the Firebase UID
    const firebaseUid = userId;
    
    console.log('🔔 [savePushSubscription] Using Firebase UID:', firebaseUid);

    // Handle both Web Push subscriptions and Huawei HMS tokens
    let subscriptionData: any = {
      userId: firebaseUid,  // Store Firebase UID for security rules
      endpoint: subscription.endpoint,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // For Web Push subscriptions, extract encryption keys
    if (subscription.endpoint.startsWith('huawei:')) {
      // Huawei HMS token - simpler structure
      console.log('🔔 [savePushSubscription] Detected Huawei HMS token');
      subscriptionData.type = 'huawei_hms';
    } else {
      // Standard Web Push subscription
      console.log('🔔 [savePushSubscription] Detected Web Push subscription');
      subscriptionData.type = 'web_push';
      subscriptionData.keys = {
        p256dh: subscription.getKey?.('p256dh') ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))) : '',
        auth: subscription.getKey?.('auth') ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!)))) : ''
      };
    }

    const subscriptionId = `${firebaseUid}_${Date.now()}`;
    console.log('🔔 [savePushSubscription] Saving to pushSubscriptions collection with ID:', subscriptionId);
    
    await saveDoc('pushSubscriptions', subscriptionId, subscriptionData);
    
    console.log('✅ Push subscription saved to Firebase:', subscriptionId);
  } catch (error) {
    console.error('❌ Error saving push subscription:', error);
    throw error;
  }
};

// Get user's push subscriptions
export const getUserPushSubscriptions = async (userId: string): Promise<any[]> => {
  try {
    // userId here is the custom user ID, but subscriptions are stored by Firebase UID
    // Get the Firebase UID from the current user
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) {
      console.warn('Not authenticated - cannot fetch subscriptions');
      return [];
    }
    
    const q = query(collection(db, 'pushSubscriptions'), where('userId', '==', firebaseUid));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return [];
  }
};

// Remove push subscription
export const removePushSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    await removeDoc('pushSubscriptions', subscriptionId);
    console.log('✅ Push subscription removed:', subscriptionId);
  } catch (error) {
    console.error('❌ Error removing push subscription:', error);
    throw error;
  }
};
