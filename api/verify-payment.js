// api/verify-payment.js
// Vercel serverless function — verifies a Paystack transaction server-side,
// validates amount/currency against our own plan table, and (when a Firebase
// service account is configured) writes the subscription server-side.
// GET /api/verify-payment?ref=EP-uid-123   (or POST { reference })

import { PLANS, convertFromNGN, CURRENCIES, teamPrice } from "../src/config/plans.js";

const ALLOWED_CURRENCIES = new Set(Object.keys(CURRENCIES));
const YEARLY_PLANS = new Set(["pro_yearly", "ielts", "team_yearly"]);
const KNOWN_PLANS = new Set([
  "pro_monthly", "pro_yearly", "ielts",
  "team_monthly", "team_yearly",
]);

function expectedCharge(meta) {
  const plan = meta?.plan;
  const currency = meta?.currency || "NGN";
  if (!ALLOWED_CURRENCIES.has(currency)) return null;

  if (meta?.teamPurchase) {
    if (plan !== "team_monthly" && plan !== "team_yearly") return null;
    const seats = Math.min(100, Math.max(2, Math.floor(Number(meta.seats) || 2)));
    const ngn = teamPrice(plan, seats);
    return { minor: Math.round(convertFromNGN(ngn, currency) * 100), ngn, plan };
  }

  if (meta?.customPayment) {
    const ngn = Math.ceil(Number(meta.amountNaira) || 0);
    if (ngn < PLANS.pro_monthly.price) return null;
    return { minor: Math.round(convertFromNGN(ngn, currency) * 100), ngn, plan: "pro_monthly" };
  }

  const p = PLANS[plan];
  if (!p || p.price <= 0) return null;
  return { minor: Math.round(convertFromNGN(p.price, currency) * 100), ngn: p.price, plan };
}

function endDateFor(plan) {
  const d = new Date();
  if (YEARLY_PLANS.has(plan)) {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setDate(d.getDate() + 30);
  }
  d.setHours(23, 59, 59, 999);
  return d;
}

async function activateOnServer({ userId, plan, reference }) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!sa || !userId) return false;
  try {
    const admin = await import("firebase-admin");
    const adminLib = admin.default || admin;
    if (!adminLib.apps.length) {
      adminLib.initializeApp({
        credential: adminLib.credential.cert(JSON.parse(sa)),
      });
    }
    const db = adminLib.firestore();
    const endDate = endDateFor(plan);
    const isTeam = plan === "team_monthly" || plan === "team_yearly";
    if (isTeam) return false;

    await db.collection("users").doc(userId).set(
      {
        subscription: {
          plan,
          status: "active",
          reference,
          startDate: adminLib.firestore.FieldValue.serverTimestamp(),
          endDate: endDate.toISOString(),
          autoRenew: true,
          verified: true,
        },
      },
      { merge: true }
    );
    await db.collection("payments").doc(reference).set(
      {
        reference,
        userId,
        plan,
        amount: null,
        verified: true,
        source: "verify-api",
        createdAt: adminLib.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error("[verify-payment] server activation failed:", e?.message);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ ok: false, error: "PAYSTACK_SECRET_KEY not set on the server" });
  }

  const reference =
    (req.query && req.query.ref) ||
    (req.body && (req.body.reference || req.body.ref)) ||
    (typeof req.query?.reference === "string" ? req.query.reference : null);

  if (!reference || typeof reference !== "string" || reference.length > 128) {
    return res.status(400).json({ ok: false, error: "Missing reference" });
  }

  try {
    const r = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` }, method: "GET" }
    );
    const body = await r.json().catch(() => null);

    if (!r.ok || !body || body.status !== true) {
      return res.status(400).json({
        ok: false,
        verified: false,
        error: body?.message || `Paystack verification failed (${r.status})`,
      });
    }

    const tx = body.data || {};
    const meta = tx.metadata || {};
    const currency = tx.currency;
    const userId = meta.userId || meta.uid || null;
    const plan = meta.plan || null;

    if (String(tx.status).toLowerCase() !== "success") {
      return res.status(400).json({
        ok: false,
        verified: false,
        error: `Transaction status is "${tx.status}", not success`,
      });
    }

    if (!ALLOWED_CURRENCIES.has(currency)) {
      return res.status(400).json({ ok: false, verified: false, error: "Unsupported currency" });
    }
    if (meta.currency && meta.currency !== currency) {
      return res.status(400).json({ ok: false, verified: false, error: "Currency mismatch" });
    }
    if (!KNOWN_PLANS.has(plan)) {
      return res.status(400).json({ ok: false, verified: false, error: "Unknown plan" });
    }

    const expected = expectedCharge(meta);
    if (!expected) {
      return res.status(400).json({ ok: false, verified: false, error: "Could not price this plan" });
    }
    if (Number(tx.amount) !== expected.minor) {
      return res.status(400).json({
        ok: false,
        verified: false,
        error: "Paid amount does not match plan price",
        expected: expected.minor,
        received: Number(tx.amount),
      });
    }

    let activated = false;
    const isTeam = plan === "team_monthly" || plan === "team_yearly";
    if (!isTeam && userId) {
      activated = await activateOnServer({ userId, plan, reference });
    }

    return res.status(200).json({
      ok: true,
      verified: true,
      activated,
      reference,
      userId,
      plan,
      amount: Number(tx.amount),
      amountNaira: expected.ngn,
      currency,
      paidAt: tx.paid_at || null,
    });
  } catch (e) {
    console.error("[verify-payment] error:", e?.message);
    return res.status(502).json({ ok: false, verified: false, error: "Verification service unreachable" });
  }
}
