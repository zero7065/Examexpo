export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    limits: {
      questionsPerDay: 15,
      aiTutorMessages: 0,
      mockExams: 0,
      subjects: 2,
    },
    features: [
      "15 practice questions/day",
      "2 subjects only",
      "Basic progress tracking",
    ],
    locked: [
      "AI Tutor (unlimited chat)",
      "Full Mock CBT Exams",
      "All subjects unlocked",
      "Detailed analytics",
      "Offline mode",
      "Priority support",
    ]
  },
  pro_monthly: {
    name: "Pro Monthly",
    price: 1500,
    currency: "NGN",
    paystackPlan: "monthly",
    interval: "monthly",
    features: [
      "Unlimited practice questions",
      "All subjects unlocked",
      "AI Tutor — unlimited chat",
      "Full Mock CBT Exams",
      "Detailed performance analytics",
      "Offline mode",
      "Priority support",
    ]
  },
  pro_yearly: {
    name: "Pro Yearly",
    price: 12000,
    originalPrice: 18000,
    currency: "NGN",
    paystackPlan: "yearly",
    interval: "yearly",
    badge: "BEST VALUE — Save ₦6,000",
    features: [
      "Everything in Pro Monthly",
      "2 months free",
      "Early access to new features",
      "Exclusive leaderboard badge",
    ]
  }
};