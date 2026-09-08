// api/paystack-webhook.cjs
// Vercel serverless function — Paystack webhook handler
// Place at /api/paystack-webhook.cjs — Vercel auto-detects /api routes

const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY not set");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // Verify webhook signature
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body;

  if (event.event === "charge.success") {
    const { reference, amount, customer, metadata } = event.data;

    // Extract user info from metadata (set during frontend init)
    const userId = metadata?.uid || metadata?.userId || null;
    const planId = metadata?.plan || null;
    const duration = metadata?.duration || 30;

    console.log(`[PAYSTACK] Payment confirmed: ref=${reference}, user=${userId}, plan=${planId}, amount=${amount}`);

    // Note: This project uses localStorage-based auth.
    // The frontend already activates Pro on payment success via usePaystack hook.
    // This webhook serves as server-side verification for production deployments.
    // When migrating to real Firebase, uncomment the firebase-admin code below:

    /*
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
    const db = admin.firestore();

    if (userId) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + duration);
      await db.collection("users").doc(userId).set({
        subscription: {
          plan: planId,
          status: "active",
          reference,
          startDate: admin.firestore.FieldValue.serverTimestamp(),
          endDate,
          autoRenew: true,
        },
        plan: "pro",
        planExpiry: endDate.toISOString(),
      }, { merge: true });
    }
    */
  }

  return res.status(200).json({ received: true });
};
