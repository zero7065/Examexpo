// api/_provision.js — server-side provisioning shared by verify-payment and
// the Paystack webhook. Both paths call this so a paid classroom (team) is
// always provisioned, idempotently, regardless of which event fires first.
import { endDateFor } from "./_plans.js";

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeTeamCode() {
  let s = "";
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `TEAM-${s}`;
}

// Activates (or returns) a team. Idempotent: an already-active team is left
// untouched so retries never double-spend a seat or reset the expiry.
export async function provisionTeam(adminLib, db, { teamId, userId, userEmail, plan, seats, reference, ngn }) {
  const n = Math.min(100, Math.max(2, Math.floor(Number(seats) || 2)));
  const ref = teamId ? db.collection("teams").doc(String(teamId)) : db.collection("teams").doc();
  const snap = await ref.get();

  // Already provisioned (webhook or client beat us) — leave it alone.
  if (snap.exists && snap.data().status === "active") {
    return { teamId: ref.id, code: snap.data().code, alreadyActive: true };
  }

  // Never lower an existing count and always account for the payer (they
  // always occupy seat 1). Using max() guards against a partially-written doc
  // leaving seatsUsed absent while members already contains the payer.
  const members = snap.exists && Array.isArray(snap.data().members) ? snap.data().members : [];
  const seatsUsed = Math.max(
    Number(snap.exists ? snap.data().seatsUsed || 0 : 0),
    members.length
  );
  const code = snap.exists && snap.data().code ? snap.data().code : makeTeamCode();
  const expiry = endDateFor(plan).toISOString();
  const team = {
    name: (snap.exists && snap.data().name) || "My Team",
    code,
    plan,
    seats: n,
    seatsUsed,
    members,
    payerUid: userId,
    payerEmail: userEmail || null,
    status: "active",
    reference: reference || null,
    amountPaid: ngn || 0,
    expiresAt: expiry,
    activatedAt: adminLib.firestore.FieldValue.serverTimestamp(),
  };
  // Claim the payer's seat if not already counted.
  if (!team.members.includes(userId)) {
    team.members.push(userId);
    team.seatsUsed = Math.min(n, team.seatsUsed + 1);
  }
  await ref.set(team, { merge: true });

  // Payer gets Pro via the team until it expires.
  await db.collection("users").doc(userId).set(
    {
      subscription: {
        plan,
        status: "active",
        reference: reference || `team-${ref.id}`,
        startDate: adminLib.firestore.FieldValue.serverTimestamp(),
        endDate: expiry,
        autoRenew: false,
        viaTeam: ref.id,
      },
      teamIds: adminLib.firestore.FieldValue.arrayUnion(ref.id),
    },
    { merge: true }
  );
  return { teamId: ref.id, code, alreadyActive: false };
}
