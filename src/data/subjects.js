// src/data/subjects.js
export const JAMB_SUBJECTS = [
  { id: "english", name: "Use of English Language", code: "ENG", compulsory: true, icon: "📖" },
  { id: "mathematics", name: "Mathematics", code: "MTH", compulsory: false, icon: "📐" },
  { id: "physics", name: "Physics", code: "PHY", compulsory: false, icon: "⚛️" },
  { id: "chemistry", name: "Chemistry", code: "CHE", compulsory: false, icon: "🧪" },
  { id: "biology", name: "Biology", code: "BIO", compulsory: false, icon: "🧬" },
  { id: "agricultural-science", name: "Agricultural Science", code: "AGR", compulsory: false, icon: "🌾" },
  { id: "economics", name: "Economics", code: "ECO", compulsory: false, icon: "📊" },
  { id: "government", name: "Government", code: "GOV", compulsory: false, icon: "🏛️" },
  { id: "literature", name: "Literature in English", code: "LIT", compulsory: false, icon: "📚" },
  { id: "commerce", name: "Commerce", code: "COM", compulsory: false, icon: "💼" },
  { id: "accounting", name: "Financial Accounting", code: "ACC", compulsory: false, icon: "🧾" },
  { id: "geography", name: "Geography", code: "GEO", compulsory: false, icon: "🌍" },
  { id: "crs", name: "Christian Religious Studies", code: "CRS", compulsory: false, icon: "✝️" },
  { id: "irs", name: "Islamic Studies", code: "IRS", compulsory: false, icon: "☪️" },
  { id: "yoruba", name: "Yoruba Language", code: "YOR", compulsory: false, icon: "🗣️" },
  { id: "igbo", name: "Igbo Language", code: "IGB", compulsory: false, icon: "🗣️" },
  { id: "hausa", name: "Hausa Language", code: "HAU", compulsory: false, icon: "🗣️" },
  { id: "french", name: "French", code: "FRE", compulsory: false, icon: "🇫🇷" },
  { id: "visual-arts", name: "Visual Arts", code: "VAR", compulsory: false, icon: "🎨" },
  { id: "music", name: "Music", code: "MUS", compulsory: false, icon: "🎵" },
  { id: "technical-drawing", name: "Technical Drawing", code: "TDR", compulsory: false, icon: "📏" },
];

export const WAEC_SUBJECTS = [
  { id: "english-waec", name: "English Language", code: "ENG", icon: "📖" },
  { id: "math-waec", name: "Mathematics (Core)", code: "MTH", icon: "📐" },
  { id: "physics-waec", name: "Physics", code: "PHY", icon: "⚛️" },
  { id: "chemistry-waec", name: "Chemistry", code: "CHE", icon: "🧪" },
  { id: "biology-waec", name: "Biology", code: "BIO", icon: "🧬" },
  { id: "economics-waec", name: "Economics", code: "ECO", icon: "📊" },
  { id: "government-waec", name: "Government", code: "GOV", icon: "🏛️" },
  { id: "literature-waec", name: "Literature in English", code: "LIT", icon: "📚" },
  { id: "commerce-waec", name: "Commerce", code: "COM", icon: "💼" },
  { id: "accounting-waec", name: "Financial Accounting", code: "ACC", icon: "🧾" },
  { id: "geography-waec", name: "Geography", code: "GEO", icon: "🌍" },
  { id: "crs-waec", name: "Christian Religious Studies", code: "CRS", icon: "✝️" },
  { id: "agric-waec", name: "Agricultural Science", code: "AGR", icon: "🌾" },
  { id: "further-math", name: "Further Mathematics", code: "FMT", icon: "🔢" },
];

export const JAMB_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017,
  2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007,
  2006, 2005, 2004, 2003, 2002, 2001, 2000
];

export const WAEC_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017,
  2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007,
  2006, 2005
];

export const JAMB_CBT_CONFIG = {
  totalQuestions: 180,
  questionsPerSubject: 45,
  totalSubjects: 4,
  durationMinutes: 120,
  maxScore: 400,
  passMark: 180,
  negativeMarking: false,
};

export const WAEC_CONFIG = {
  examSessions: ["May/June", "November/December"],
  gradingScale: {
    A1: { range: [75, 100], label: "Excellent", pass: true },
    B2: { range: [70, 74], label: "Very Good", pass: true },
    B3: { range: [65, 69], label: "Good", pass: true },
    C4: { range: [60, 64], label: "Credit", pass: true },
    C5: { range: [55, 59], label: "Credit", pass: true },
    C6: { range: [50, 54], label: "Credit", pass: true },
    D7: { range: [45, 49], label: "Pass", pass: false },
    E8: { range: [40, 44], label: "Pass", pass: false },
    F9: { range: [0, 39], label: "Fail", pass: false },
  },
  passingGrades: ["A1", "B2", "B3", "C4", "C5", "C6"],
};
