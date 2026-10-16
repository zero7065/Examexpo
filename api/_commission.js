// api/_commission.js — shared Partner Plan commission recorder.
// NOT a Vercel endpoint (underscore prefix). Called by verify-payment and
// the Paystack webhook. Idempotent: the commissions doc id is the Paystack
// reference and is created atomically — re-verifies cannot double-count.
// Server-only: the Firebase Admin SDK bypasses security rules.

const BASE_RATE = 0.2;
const TIER_RATE = 0.25;
const TIER_THRESHOLD = 100; // 100+ distinct paying referrals → 25%

// Returns true if a NEW commission was recorded.
export async function recordCommission(adminLib, db, { reference, userId, plan, ngn, partnerCode }) {
  if (!reference || !userId || !partnerCode) return false;
  const amountPaid = Number(ngn);
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) return false;

  try {
    // 1. Resolve the school behind this partner code.
    const schoolSnap = await db
      .collection("schools")
      .where("partner.code", "==", String(partnerCode))
      .limit(1)
      .get();
    if (schoolSnap.empty) return false;
    const schoolDoc = schoolSnap.docs[0];
    const partner = schoolDoc.data().partner || {};
    const payers = Array.isArray(partner.referredPayers) ? partner.referredPayers : [];
    const isNewPayer = !payers.includes(userId);
    const payersCount = Number(partner.payersCount || 0);
    const rate = payersCount >= TIER_THRESHOLD ? TIER_RATE : BASE_RATE;
    const commission = Math.round(amountPaid * rate);

    // 2. Atomic create keyed by the Paystack reference — this is the
    //    idempotency gate. If it already exists we bail before touching
    //    the school's counters.
    const commissionRef = db.collection("commissions").doc(reference);
    try {
      await commissionRef.create({
        schoolId: schoolDoc.id,
        partnerCode: String(partnerCode),
        userId,
        reference,
        plan: plan || null,
        amountPaidNaira: amountPaid,
        rate,
        commissionNaira: commission,
        status: "pending",
        createdAt: adminLib.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      if (e.code === 6 || String(e.message || "").includes("already exists")) return false; // idempotent replay
      throw e;
    }

    // 3. Update school partner counters.
    const updates = {
      "partner.totalEarned": adminLib.firestore.FieldValue.increment(commission),
      "partner.pendingPayout": adminLib.firestore.FieldValue.increment(commission),
    };
    if (isNewPayer) {
      updates["partner.referredPayers"] = adminLib.firestore.FieldValue.arrayUnion(userId);
      updates["partner.payersCount"] = adminLib.firestore.FieldValue.increment(1);
      if (payersCount + 1 >= TIER_THRESHOLD) updates["partner.rate"] = TIER_RATE;
    }
    await schoolDoc.ref.update(updates);
    return true;
  } catch (e) {
    // Never fail the payment flow because of commission bookkeeping.
    console.error("[commission] record failed:", e?.message);
    return false;
  }
}
