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
      "AI Tutor (unlimited chat)",
      "Full Mock Exams",
      "All subjects unlocked",
      "Detailed analytics",
      "Offline mode",
      "Priority support",
    ]
  },
  pro_monthly: {
    name: "Pro Monthly",
    price: 3000,
    currency: "NGN",
    paystackPlan: "monthly",
    interval: "monthly",
    features: [
      "Unlimited practice questions",
      "All subjects unlocked",
      "AI Tutor — unlimited chat",
      "Full Mock Exams",
      "Detailed performance analytics",
      "Offline mode",
      "Priority support",
    ]
  },
  pro_yearly: {
    name: "Pro Yearly",
    price: 25000,
    originalPrice: 36000,
    currency: "NGN",
    paystackPlan: "yearly",
    interval: "yearly",
    badge: "BEST VALUE — Save ₦11,000",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
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
      "Full IELTS question bank (132+ questions)",
      "IELTS band score calculator",
      "Writing task feedback (AI)",
      "Speaking practice prompts",
      "Visa requirement guide",
      "Priority IELTS support",
    ]
  }
};

export const TEAM_MIN_SEATS = 2;
export const TEAM_MAX_SEATS = 100;

export const TEAM_PLANS = {
  team_monthly: { name: "Team Monthly", pricePerSeat: 3000, interval: "monthly" },
  team_yearly: { name: "Team Yearly", pricePerSeat: 25000, interval: "yearly" },
};

export function teamPrice(plan, seats) {
  const t = TEAM_PLANS[plan] || TEAM_PLANS.team_monthly;
  const n = Math.min(TEAM_MAX_SEATS, Math.max(TEAM_MIN_SEATS, Math.floor(seats || TEAM_MIN_SEATS)));
  let total;
  if (plan === "team_yearly") {
    total = t.pricePerSeat;
  } else {
    total = t.pricePerSeat * n;
  }
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
  NGN: { symbol: "₦", rate: 1, label: "Naira", minCustom: 3000 },
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