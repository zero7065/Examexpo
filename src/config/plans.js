export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      questionsPerDay: 15,
      aiTutorMessages: 3,
      mockExams: 0,
      subjects: 2,
    },
    features: [
      "15 practice questions/day",
      "3 AI tutor messages/day",
      "2 subjects only",
      "Basic progress tracking",
    ],
    locked: [
      "AI Tutor (extra messages with Pro)",
      "Full Mock Exams",
      "All subjects unlocked",
      "Detailed analytics",
      "Offline mode",
      "Priority support",
    ]
  },
  pro_monthly: {
    name: "Pro Monthly",
    price: 3500,
    currency: "NGN",
    paystackPlan: "monthly",
    interval: "monthly",
    features: [
      "Unlimited practice questions",
      "All subjects unlocked",
      "AI Tutor — 60 messages/month",
      "Full Mock Exams",
      "Detailed performance analytics",
      "Offline mode",
      "Priority support",
    ]
  },
  pro_yearly: {
    name: "Pro Yearly",
    price: 28000,
    originalPrice: 42000,
    currency: "NGN",
    paystackPlan: "yearly",
    interval: "yearly",
    badge: "RECOMMENDED — Save ₦14,000",
    features: [
      "Everything in Pro Monthly",
      "AI Tutor — 80 messages/month",
      "14-day money-back if you use under 30 AI messages",
      "Early access to new features",
      "Exclusive leaderboard badge",
    ]
  },
  ielts: {
    name: "IELTS Preparation",
    price: 80000,
    currency: "NGN",
    paystackPlan: "ielts_yearly",
    interval: "yearly",
    badge: "IELTS — Study Abroad Ready",
    features: [
      "Everything in Pro Yearly",
      "AI Tutor — 80 messages/month",
      "Full IELTS question bank (100 questions)",
      "IELTS band score calculator",
      "Speaking practice prompts",
      "Visa requirement guide",
      "Priority IELTS support",
    ]
  },
  ai_pack_50: {
    name: "AI Top-up",
    price: 1500,
    currency: "NGN",
    paystackPlan: "ai_pack_50",
    interval: "one-time",
    badge: "50 extra AI messages",
    features: [
      "50 extra AI messages",
      "Stacks on top of your plan",
      "Never expires",
    ]
  }
};

// ─── AI credit system (per paid plan) ───
// Monthly allowance: plan-cycle cap. Daily cap: smoothing so students
// can't burn the whole allowance in week 1. Packs are a bonus pool spent
// after the plan allowance. Free = plain daily counter.
export const AI_LIMITS = {
  free: { perDay: 3, perMonth: 0, dailyCap: 3 },
  pro_monthly: { perDay: 0, perMonth: 60, dailyCap: 7 },
  pro_yearly: { perDay: 0, perMonth: 80, dailyCap: 9 },
  ielts: { perDay: 0, perMonth: 80, dailyCap: 9 },
  default: { perDay: 0, perMonth: 60, dailyCap: 7 },
};

export const AI_PACK_MESSAGES = 50;
export const AI_SOFT_WARNING_PCT = 0.8;

export function aiLimitsFor(planId) {
  return AI_LIMITS[planId] || AI_LIMITS.default;
}

export const TEAM_MIN_SEATS = 2;
export const TEAM_MAX_SEATS = 100;

export const TEAM_PLANS = {
  team_monthly: { name: "Classroom Monthly", pricePerSeat: 2800, interval: "monthly" },
  team_yearly: { name: "Classroom Yearly", pricePerSeat: 28000, interval: "yearly" },
};

export function teamPrice(plan, seats) {
  const t = TEAM_PLANS[plan] || TEAM_PLANS.team_monthly;
  const n = Math.min(TEAM_MAX_SEATS, Math.max(TEAM_MIN_SEATS, Math.floor(seats || TEAM_MIN_SEATS)));
  const yearly = plan === "team_yearly";
  // Classroom Yearly: ₦28,000/seat base → ₦22,000/seat locked at 15+ seats.
  // Classroom Monthly: ₦2,800/seat → 10% off at 10+, 20% off at 15+.
  if (yearly) {
    const perSeat = n >= 15 ? 22000 : t.pricePerSeat;
    return perSeat * n;
  }
  let total = t.pricePerSeat * n;
  if (n >= 15) total = Math.round(total * 0.8);
  else if (n >= 10) total = Math.round(total * 0.9);
  return total;
}

export function teamDiscount(seats) {
  const n = Math.floor(seats || 0);
  if (n >= 15) return 20;
  if (n >= 10) return 10;
  return 0;
}

// ─── Multi-currency: Paystack-supported currencies ───
// NGN amounts are the source of truth; other currencies convert at fixed,
// slightly-conservative rates so payouts always cover the NGN price.
export const CURRENCIES = {
  NGN: { symbol: "₦", rate: 1, label: "Naira", minCustom: 3500 },
  USD: { symbol: "$", rate: 0.00065, label: "US Dollar", minCustom: 20 },
  GHS: { symbol: "₵", label: "Ghana Cedi", rate: 0.008, minCustom: 250 },
  KES: { symbol: "KSh ", label: "Kenyan Shilling", rate: 0.084, minCustom: 2600 },
  ZAR: { symbol: "R", label: "Rand", rate: 0.012, minCustom: 360 },
};

export function convertFromNGN(ngn, currency) {
  const c = CURRENCIES[currency] || CURRENCIES.NGN;
  const units = ngn * c.rate;
  // Round up to whole minor-friendly units (2dp for USD, 0dp others)
  return currency === "USD" ? Math.ceil(units * 100) / 100 : Math.ceil(units);
}

export function formatMoney(ngn, currency = "NGN") {
  const c = CURRENCIES[currency] || CURRENCIES.NGN;
  const v = convertFromNGN(ngn, currency);
  return `${c.symbol}${Number(v).toLocaleString()}`;
}
