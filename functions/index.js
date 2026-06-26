const { onRequest } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

exports.paystackWebhook = onRequest(
  { secrets: ["PAYSTACK_SECRET_KEY"] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signature = req.headers["x-paystack-signature"];
    if (!signature || !PAYSTACK_SECRET) {
      logger.warn("Missing signature or secret key");
      res.status(401).send("Unauthorized");
      return;
    }

    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      logger.warn("Invalid webhook signature");
      res.status(401).send("Unauthorized");
      return;
    }

    const event = req.body;
    logger.info(`Paystack event: ${event.event}`, { reference: event.data?.reference });

    if (event.event === "charge.success") {
      const { reference, metadata, amount, status } = event.data;

      // Parse metadata from both formats:
      // 1. Top-level keys: { userId, plan } — used by usePaystack.js hook
      // 2. custom_fields array: [{ variable_name, value }] — used by paystack.js / PaymentPage
      let userId = metadata?.userId;
      let plan = metadata?.plan;

      if (!userId || !plan) {
        const fields = metadata?.custom_fields || [];
        userId = userId || fields.find(f => f.variable_name === "user_uid")?.value;
        plan = plan || fields.find(f => f.variable_name === "plan_id")?.value;
      }

      if (!userId || !plan || !reference) {
        logger.error("Missing userId, plan, or reference in webhook payload", { metadata: JSON.stringify(metadata) });
        res.status(400).send("Bad Request");
        return;
      }

      const now = admin.firestore.Timestamp.now();
      const isYearly = plan === "pro_yearly" || plan === "proYearly";
      const endDate = isYearly
        ? new Date(now.toDate().setFullYear(now.toDate().getFullYear() + 1))
        : new Date(now.toDate().setMonth(now.toDate().getMonth() + 1));

      try {
        await db.runTransaction(async (tx) => {
          const paymentRef = db.collection("payments").doc(reference);
          tx.set(paymentRef, {
            userId,
            reference,
            plan,
            amount: amount / 100,
            status: "verified",
            verifiedAt: now,
            paystackReference: reference,
          });

          const userRef = db.collection("users").doc(userId);
          tx.update(userRef, {
            subscription: {
              plan,
              status: "active",
              reference,
              startDate: now,
              endDate: admin.firestore.Timestamp.fromDate(endDate),
              autoRenew: true,
              webhookVerified: true,
              verifiedAt: now,
            },
          });
        });

        logger.info(`Payment verified for user ${userId}`, { reference, plan });
        res.status(200).json({ status: "verified" });
      } catch (err) {
        logger.error("Transaction failed", err);
        res.status(500).send("Internal Server Error");
      }
    } else {
      res.status(200).json({ status: "ignored" });
    }
  }
);
