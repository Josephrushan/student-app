// api/paystack-webhook.js
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const firebaseAdminConfig = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig)
  });
}

const db = admin.firestore();

/**
 * Verifies Paystack webhook signature
 */
function verifyPaystackSignature(request, secret) {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(request.body))
    .digest('hex');
  return hash === request.headers['x-paystack-signature'];
}

/**
 * Logs subscription changes to audit trail
 */
async function logSubscriptionChange(event, parentId, parentEmail, studentsAffected, details) {
  try {
    await db.collection('subscriptionAuditLog').add({
      timestamp: new Date(),
      parentId,
      parentEmail,
      eventType: event,
      planCode: details.planCode || null,
      planName: details.planName || null,
      amount: details.amount || null,
      studentsAffected: studentsAffected || 0,
      reason: details.reason || 'Not specified',
      source: 'paystack_webhook',
      metadata: {
        customerId: details.customerId || null,
        subscriptionCode: details.subscriptionCode || null,
        transactionReference: details.transactionReference || null
      }
    });
    console.log(`✅ Audit log created for event: ${event}`);
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
    // Don't fail the webhook if logging fails - log updates are non-critical
  }
}

/**
 * Handles subscription cancellation
 * Updates parent isPaid to false and cascades to linked students
 */
async function handleSubscriptionDisable(event) {
  try {
    const { customer, plan } = event.data;
    const customerEmail = customer.email;

    console.log(`📋 Processing subscription disable for: ${customerEmail}`);
    console.log(`   Plan: ${plan.name} (${plan.plan_code})`);
    console.log(`   Reason: ${event.data.reason || 'Not specified'}`);

    // Find parent user by email
    const parentQuery = await db
      .collection('users')
      .where('email', '==', customerEmail.toLowerCase())
      .where('role', '==', 'Parent')
      .get();

    if (parentQuery.empty) {
      console.warn(`⚠️ Parent not found for email: ${customerEmail}`);
      return { success: false, message: 'Parent not found' };
    }

    const parentDoc = parentQuery.docs[0];
    const parentId = parentDoc.id;
    const parentName = parentDoc.data().name || 'Unknown';

    console.log(`🔍 Found parent: ${parentId} (${parentName})`);

    // Update parent isPaid to false
    await db.collection('users').doc(parentId).update({
      isPaid: false,
      subscriptionCancelledAt: new Date(),
      subscriptionStatus: 'cancelled'
    });

    console.log(`✅ Parent ${parentId} marked as unpaid`);

    // Find all linked students and revoke access
    const studentsQuery = await db
      .collection('users')
      .where('parentId', '==', parentId)
      .get();

    const studentUpdatePromises = studentsQuery.docs.map(studentDoc =>
      db.collection('users').doc(studentDoc.id).update({
        isPaid: false,
        accessRevoked: true,
        revokedAt: new Date(),
        revokeReason: 'Parent subscription cancelled'
      })
    );

    await Promise.all(studentUpdatePromises);

    console.log(`✅ Revoked access for ${studentsQuery.docs.length} student(s)`);
    console.log(`📊 Summary: 1 parent + ${studentsQuery.docs.length} student(s) access revoked`);

    // Log subscription cancellation to audit trail
    await logSubscriptionChange('subscription.disable', parentId, customerEmail, studentsQuery.docs.length, {
      planCode: plan.plan_code,
      planName: plan.name,
      reason: event.data.reason || 'Subscription cancelled by customer',
      customerId: customer.id,
      subscriptionCode: event.data.subscription_code || null
    });

    return {
      success: true,
      message: `Parent and ${studentsQuery.docs.length} student(s) access revoked`,
      parentId,
      studentsAffected: studentsQuery.docs.length
    };
  } catch (error) {
    console.error('❌ Error processing subscription disable:', error);
    console.error('📍 Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Handles subscription renewal/charge success
 */
async function handleChargeSuccess(event) {
  try {
    const { customer, amount, plan } = event.data;
    const customerEmail = customer.email;

    console.log(`💰 Processing charge success for: ${customerEmail}`);
    console.log(`   Amount: ${(amount / 100).toFixed(2)} ZAR`);
    console.log(`   Plan: ${plan.name} (${plan.plan_code})`);

    const parentQuery = await db
      .collection('users')
      .where('email', '==', customerEmail.toLowerCase())
      .where('role', '==', 'Parent')
      .get();

    if (parentQuery.empty) {
      console.warn(`⚠️ Parent not found for email: ${customerEmail}`);
      return { success: false, message: 'Parent not found' };
    }

    const parentDoc = parentQuery.docs[0];
    const parentId = parentDoc.id;
    const parentName = parentDoc.data().name || 'Unknown';

    console.log(`🔍 Found parent: ${parentId} (${parentName})`);

    // Update parent isPaid to true
    await db.collection('users').doc(parentId).update({
      isPaid: true,
      lastPaymentDate: new Date(),
      subscriptionStatus: 'active',
      accessRevoked: false
    });

    console.log(`✅ Parent ${parentId} subscription renewed`);

    // Re-enable all linked students
    const studentsQuery = await db
      .collection('users')
      .where('parentId', '==', parentId)
      .get();

    const studentUpdatePromises = studentsQuery.docs.map(studentDoc =>
      db.collection('users').doc(studentDoc.id).update({
        isPaid: true,
        accessRevoked: false
      })
    );

    await Promise.all(studentUpdatePromises);

    console.log(`✅ Restored access for ${studentsQuery.docs.length} student(s)`);
    console.log(`📊 Summary: 1 parent + ${studentsQuery.docs.length} student(s) access restored`);

    // Log subscription renewal to audit trail
    await logSubscriptionChange('charge.success', parentId, customerEmail, studentsQuery.docs.length, {
      planCode: plan.plan_code,
      planName: plan.name,
      amount: amount / 100, // Convert from kobo to ZAR
      customerId: customer.id,
      subscriptionCode: event.data.subscription_code || null,
      transactionReference: event.data.reference || null
    });

    return {
      success: true,
      message: `Parent and ${studentsQuery.docs.length} student(s) access restored`,
      parentId,
      studentsAffected: studentsQuery.docs.length
    };
  } catch (error) {
    console.error('❌ Error processing charge success:', error);
    console.error('📍 Stack trace:', error.stack);
    return { success: false, error: error.message };
  }
}

/**
 * Main webhook handler
 */
export default async function handler(request, response) {
  // Allow GET for health checks
  if (request.method === 'GET') {
    return response.status(200).json({
      status: 'healthy',
      message: 'Paystack webhook endpoint is active',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  }

  // Only allow POST requests for webhook events
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = request.body;
    const secret = process.env.PAYSTACK_SECRET_KEY;

    // Note: x-paystack-signature verification would go here
    // For now, we'll accept the webhook but in production, verify the signature
    console.log(`📨 Webhook received: ${event.event}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`📦 Event data:`, JSON.stringify(event.data, null, 2));

    // Validate event structure
    if (!event.event || !event.data) {
      console.warn('⚠️ Malformed webhook payload - missing event or data');
      return response.status(400).json({
        error: 'Invalid webhook payload',
        details: 'event and data fields are required'
      });
    }

    let result;

    switch (event.event) {
      case 'subscription.disable':
        console.log('🔴 Processing SUBSCRIPTION DISABLE event...');
        result = await handleSubscriptionDisable(event);
        break;

      case 'charge.success':
        console.log('🟢 Processing CHARGE SUCCESS event...');
        // Only handle if it's a subscription charge
        if (event.data.authorization && event.data.authorization.authorization_code) {
          result = await handleChargeSuccess(event);
        } else {
          console.log('⏭️ Skipping non-subscription charge');
          result = { success: true, message: 'Non-subscription charge, skipped' };
        }
        break;

      default:
        console.log(`⏭️ Ignoring event: ${event.event}`);
        result = { success: true, message: 'Event processed' };
    }

    console.log(`✅ Webhook result:`, result);
    return response.status(200).json(result);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('📍 Stack trace:', error.stack);
    return response.status(500).json({
      error: 'Webhook processing failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
