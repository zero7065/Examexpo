export const ACHIEVEMENTS = [
  { id: "first_question", icon: "🎯", name: "First Step", desc: "Answer your first question", condition: (p) => p.totalQuestionsAnswered >= 1 },
  { id: "streak_3", icon: "🔥", name: "On Fire", desc: "3-day study streak", condition: (p) => p.streak >= 3 },
  { id: "streak_7", icon: "⚡", name: "Unstoppable", desc: "7-day study streak", condition: (p) => p.streak >= 7 },
  { id: "questions_50", icon: "📚", name: "Bookworm", desc: "Answer 50 questions", condition: (p) => p.totalQuestionsAnswered >= 50 },
  { id: "questions_200", icon: "🧠", name: "Scholar", desc: "Answer 200 questions", condition: (p) => p.totalQuestionsAnswered >= 200 },
  { id: "mock_first", icon: "📝", name: "Test Taker", desc: "Complete your first mock exam", condition: (p) => p.mockExamsCompleted >= 1 },
  { id: "mock_5", icon: "🏆", name: "Exam Ready", desc: "Complete 5 mock exams", condition: (p) => p.mockExamsCompleted >= 5 },
  { id: "score_80", icon: "⭐", name: "High Scorer", desc: "Score 80%+ in any session", condition: (p) => p.bestScore >= 80 },
  { id: "score_90", icon: "👑", name: "Top of Class", desc: "Score 90%+ in any session", condition: (p) => p.bestScore >= 90 },
  { id: "level_5", icon: "🚀", name: "Level Up", desc: "Reach Level 5", condition: (p) => Math.floor(p.totalXP / 500) >= 5 },
];