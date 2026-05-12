export const FEATURE_GATES = {
  // FREE — enough to feel the value
  practiceMode: "free",          // basic quiz, any subject
  dailyQuestions: 30,            // 30 questions/day cap
  aiExplanations: 5,             // 5 AI explanations/day
  yearsAccess: [2024, 2025, 2026], // only recent years free
  subjectsAccess: "all",         // all subjects (drives engagement)
  shareQuestion: "free",         // sharing is free (marketing)
  basicStats: "free",            // total questions + streak only

  // PRO — ₦3,000/month unlocks all of this
  cbтSimulator: "pro",           // full 180-question CBT exam
  unlimitedQuestions: "pro",     // no 30/day cap
  unlimitedAI: "pro",            // unlimited Groq explanations
  allYears: "pro",               // 2014–2026 full archive
  fullStats: "pro",              // per-subject breakdown + heatmap
  pastQuestionsPage: "pro",      // dedicated past questions section
  examPredictor: "pro",          // likely topics AI feature
  studyPlan: "pro",              // AI study plan generator
  weakTopicDrills: "pro",        // targeted practice by weak topic
};
