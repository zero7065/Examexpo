// api/paystack-webhook.js
// Vercel serverless function — Paystack webhook handler.
// Signature must be computed over the RAW request body, so body parsing is
// disabled (see `config` export) and the stream is read manually.

import crypto from "crypto";

export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  if (req.rawBody) return Promise.resolve(req.rawBody);
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) reject(new Error("Body too large"));
    });
    req.on("end", () => resolve(Buffer.from(data, "utf8")));
    req.on("error", reject);
  });
}

async function getDb() {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa) return null;
  const admin = await import("firebase-admin");
  const adminLib = admin.default || admin;
  if (!adminLib.apps.length) {
    adminLib.initializeApp({ credential: adminLib.credential.cert(JSON.parse(sa)) });
  }
  return adminLib.firestore();
}

function endDateFor(plan) {
  const d = new Date();
  if (plan === "pro_yearly" || plan === "ielts") d.setFullYear(d.getFullYear() + 1);
  else d.setDate(d.getDate() + 30);
  d.setHours(23, 59, 59, 999);
  return d;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("[webhook] PAYSTACK_SECRET_KEY not set");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(raw)
    .digest("hex");

  const provided = req.headers["x-paystack-signature"];
  if (!provided || hash !== provided) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (event.event === "charge.success") {
    const data = event.data || {};
    const reference = data.reference || null;
    const metadata = data.metadata || {};
    const userId = metadata.userId || metadata.uid || null;
    const plan = metadata.plan || null;
    const amountMinor = Number(data.amount || 0);

    console.log(
      `[webhook] charge.success ref=${reference} user=${userId} plan=${plan} amount=${amountMinor} ${data.currency || ""}`
    );

    const db = await getDb();
    if (db && userId && plan && reference && amountMinor > 0) {
      const isTeam = plan === "team_monthly" || plan === "team_yearly";
      try {
        await db.collection("payments").doc(reference).set(
          {
            reference,
            userId,
            plan,
            amount: amountMinor / 100,
            currency: data.currency || "NGN",
            event: event.event,
            webhookVerified: true,
            createdAt: new Date(),
          },
          { merge: true }
        );
        if (!isTeam) {
          await db.collection("users").doc(userId).set(
            {
              subscription: {
                plan,
                status: "active",
                reference,
                startDate: new Date().toISOString(),
                endDate: endDateFor(plan).toISOString(),
                autoRenew: true,
                verified: true,
                webhookVerified: true,
              },
            },
            { merge: true }
          );
        }
      } catch (e) {
        console.error("[webhook] write failed:", e?.message);
        return res.status(500).json({ error: "Write failed" });
      }
    }
  }

  return res.status(200).json({ received: true });
}
