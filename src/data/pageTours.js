export const PAGE_TOURS = {
  "/dashboard": {
    title: "Dashboard",
    steps: [
      { target: "[data-tour='subjects']", title: "Your Subjects", content: "Pick a subject to start practicing. Each card shows your progress." },
      { target: "[data-tour='daily-challenge']", title: "Daily Challenge", content: "10 mixed questions with 2x XP. Come back every day to build your streak." },
      { target: "[data-tour='quick-quiz']", title: "Quick Quiz", content: "Jump into a quick practice session for any subject." },
      { target: "[data-tour='ai-tutor']", title: "AI Tutor", content: "Ask any question and get instant explanations powered by AI." },
    ],
  },
  "/practice": {
    title: "Practice Mode",
    steps: [
      { target: "[data-tour='mode']", title: "Study Mode", content: "Choose Free Practice, Timed Mode, or CBT simulation." },
      { target: "[data-tour='subject']", title: "Select Subject", content: "Pick the subject you want to practice." },
      { target: "[data-tour='start']", title: "Start Session", content: "Click Start to begin your practice session." },
    ],
  },
  "/ai-tutor": {
    title: "AI Tutor",
    steps: [
      { target: "[data-tour='chat-input']", title: "Ask Anything", content: "Type your question here. The AI tutor can explain concepts, solve problems, and more." },
      { target: "[data-tour='image-upload']", title: "Upload Images", content: "Attach photos of questions or notes for the AI to analyze." },
      { target: "[data-tour='analyze-mode']", title: "Document Analysis", content: "Toggle analyze mode to extract key points from document photos." },
      { target: "[data-tour='sessions']", title: "Session History", content: "Access and resume past conversations." },
    ],
  },
  "/mock-exam": {
    title: "Mock Exam",
    steps: [
      { target: "[data-tour='exam-setup']", title: "Exam Setup", content: "Choose your exam type, subjects, and duration." },
      { target: "[data-tour='start-exam']", title: "Start Exam", content: "Begin your timed mock exam simulation." },
    ],
  },
  "/study-partners": {
    title: "Study Partners",
    steps: [
      { target: "[data-tour='find-partner']", title: "Find Partners", content: "Connect with other students studying the same subjects." },
      { target: "[data-tour='invite']", title: "Invite Friends", content: "Share invite codes to study together." },
    ],
  },
  "/leaderboard": {
    title: "Leaderboard",
    steps: [
      { target: "[data-tour='rankings']", title: "Rankings", content: "See how you rank against other students." },
      { target: "[data-tour='active-badge']", title: "Active Badges", content: "Green badges show students active today." },
    ],
  },
  "/flashcards": {
    title: "Flashcards",
    steps: [
      { target: "[data-tour='deck']", title: "Choose Deck", content: "Select a subject deck to study." },
      { target: "[data-tour='flip']", title: "Flip Cards", content: "Click to reveal answers. Swipe through the deck." },
    ],
  },
  "/settings": {
    title: "Settings",
    steps: [
      { target: "[data-tour='profile']", title: "Profile", content: "Edit your name, exam type, and target score." },
      { target: "[data-tour='subjects']", title: "Subjects", content: "Toggle which subjects you want to study." },
      { target: "[data-tour='exams']", title: "My Exams", content: "Enable or disable specific exams." },
      { target: "[data-tour='ai-tutor']", title: "AI Preferences", content: "Set your learning style for better AI responses." },
      { target: "[data-tour='notifications']", title: "Notifications", content: "Manage reminder preferences." },
    ],
  },
  "/question-bank": {
    title: "Question Bank",
    steps: [
      { target: "[data-tour='filters']", title: "Filters", content: "Filter by subject, year, difficulty, and exam type." },
      { target: "[data-tour='search']", title: "Search", content: "Search for specific questions or topics." },
    ],
  },
  "/progress": {
    title: "Progress",
    steps: [
      { target: "[data-tour='stats']", title: "Your Stats", content: "View accuracy, XP, streaks, and topic mastery." },
      { target: "[data-tour='timeline']", title: "Timeline", content: "See your learning journey over time." },
    ],
  },
};

export const NEW_USER_CHECKLIST = [
  { id: "profile", label: "Complete your profile", done: (p) => p?.name && p?.exam, page: "/settings" },
  { id: "subjects", label: "Pick your subjects", done: (p) => p?.subjects?.length >= 3, page: "/settings" },
  { id: "target", label: "Set your target score", done: (p) => p?.targetScore, page: "/settings" },
  { id: "practice", label: "Take your first practice", done: (p) => p?.totalQuestions > 0, page: "/practice" },
  { id: "ai-tutor", label: "Ask the AI Tutor", done: (p) => p?.totalAIUsage > 0, page: "/ai-tutor" },
  { id: "mock-exam", label: "Try a mock exam", done: (p) => p?.mockExamsTaken > 0, page: "/mock-exam" },
];
