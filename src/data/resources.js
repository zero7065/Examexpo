// Curated books, PDFs and study tools per subject.
// Titles only (no piracy): where to legally get each item + what it's best for.
export const BOOK_RECS = [
  { subject: "Use of English", title: "Countdown to JAMB English", type: "Book", note: "Lexis, structure & oral forms drills", where: "Bookshops / JAMB vendors" },
  { subject: "Use of English", title: "ExamPadi Tutor + Flashcards", type: "In-app tool", note: "Daily lexis reps with spaced recall", where: "This app → AI Tutor" },
  { subject: "Mathematics", title: "New General Mathematics (SSS 1–3)", type: "Book", note: "The WAEC/JAMB syllabus backbone", where: "Bookshops" },
  { subject: "Mathematics", title: "ExamPadi Question Bank (Maths filter)", type: "In-app tool", note: "400+ past questions by topic", where: "This app → Question Bank" },
  { subject: "Physics", title: "Comprehensive Physics for SSS", type: "Book", note: "Clear derivations + worked examples", where: "Bookshops" },
  { subject: "Chemistry", title: "Essential Chemistry (Osei Yaw Ababio)", type: "Book", note: "The classic WAEC/NECO chemistry text", where: "Bookshops" },
  { subject: "Biology", title: "Modern Biology for SSS", type: "Book", note: "Diagrams examiners love", where: "Bookshops" },
  { subject: "Economics", title: "Comprehensive Economics (Johnson Ugoji)", type: "Book", note: "Graphs explained simply", where: "Bookshops" },
  { subject: "Government", title: "Comprehensive Government (Adediran)", type: "Book", note: "Constitutions & ECOWAS made plain", where: "Bookshops" },
  { subject: "All subjects", title: "JAMB CBT practice app (offline mode)", type: "In-app tool", note: "Simulate exam pressure weekly", where: "This app → Mock Exam" },
  { subject: "All subjects", title: "WAEC/NECO past question PDFs", type: "PDF", note: "Free on myschool.ng & official WAEC portals", where: "myschool.ng (free)" },
  { subject: "IELTS", title: "Cambridge IELTS Trainer + official practice tests", type: "Book/PDF", note: "Only use official Cambridge material", where: "British Council / IDP portals" },
];

export const BOOK_SUBJECTS = ["All", ...new Set(BOOK_RECS.map((b) => b.subject))];
