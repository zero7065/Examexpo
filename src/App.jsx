import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StudyProvider } from "./context/StudyContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import ScrollToTop from "./components/ScrollToTop";
import InstallPrompt from "./components/InstallPrompt";
import { useAuth } from "./context/AuthContext";

// Critical path — direct imports
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import NotFoundPage from "./pages/NotFoundPage";

// Everything else lazy-loaded
const SubjectSelector = lazy(() => import("./pages/SubjectSelector"));
const Practice = lazy(() => import("./pages/Practice"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const CBTSimulator = lazy(() => import("./pages/CBTSimulator"));
const ResultPage = lazy(() => import("./pages/ResultPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const PastQuestionsPage = lazy(() => import("./pages/PastQuestionsPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotepadPage = lazy(() => import("./pages/NotepadPage"));
const StudyPlanPage = lazy(() => import("./pages/StudyPlanPage"));
const SessionHistoryPage = lazy(() => import("./pages/SessionHistoryPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const QuestionBank = lazy(() => import("./pages/QuestionBank"));
const PracticeSession = lazy(() => import("./pages/PracticeSession"));
const SessionSummary = lazy(() => import("./pages/SessionSummary"));
const MockExam = lazy(() => import("./pages/MockExam"));
const MockSummary = lazy(() => import("./pages/MockSummary"));
const AITutor = lazy(() => import("./pages/AITutor"));
const Progress = lazy(() => import("./pages/Progress"));
const Settings = lazy(() => import("./pages/Settings"));

function PageLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #1e1e2a", borderTopColor: "#6C3CE9", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AuthAwareRoutes() {
  const { user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (loading) { document.title = "ExamPadi AI"; return; }
    const titles = {
      "/auth": "Sign In — ExamPadi AI",
      "/onboarding": "Get Started — ExamPadi AI",
      "/dashboard": "Dashboard — ExamPadi AI",
      "/practice": "Practice — ExamPadi AI",
      "/practice-select": "Start Practice — ExamPadi AI",
      "/question-bank": "Question Bank — ExamPadi AI",
      "/session-summary": "Session Summary — ExamPadi AI",
      "/mock-exam": "Mock Exam — ExamPadi AI",
      "/mock-summary": "Exam Results — ExamPadi AI",
      "/ai-tutor": "AI Tutor — ExamPadi AI",
      "/progress": "Progress — ExamPadi AI",
      "/settings": "Settings — ExamPadi AI",
      "/select": "Select Subjects — ExamPadi AI",
      "/quiz": "Quiz — ExamPadi AI",
      "/cbt": "CBT Simulator — ExamPadi AI",
      "/stats": "Statistics — ExamPadi AI",
      "/profile": "Profile — ExamPadi AI",
    };
    document.title = titles[location.pathname] || "ExamPadi AI";
  }, [location.pathname, loading]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-bg text-text selection:bg-primary/30">
      <Navbar />
      <ScrollToTop />
      <main key={location.pathname} className="flex-1 md:ml-64 pb-20 md:pb-0 animate-fade">
        <InstallPrompt />
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route index element={<Dashboard />} />
          </Route>
          <Route path="/select" element={<ProtectedRoute><SubjectSelector /></ProtectedRoute>} />
          <Route path="/practice-select" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
          <Route path="/practice" element={<ProtectedRoute><PracticeSession /></ProtectedRoute>} />
          <Route path="/question-bank" element={<ProtectedRoute><QuestionBank /></ProtectedRoute>} />
          <Route path="/session-summary" element={<ProtectedRoute><SessionSummary /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
          <Route path="/cbt" element={<ProtectedRoute><CBTSimulator /></ProtectedRoute>} />
          <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
          <Route path="/past-questions" element={<ProtectedRoute><PastQuestionsPage /></ProtectedRoute>} />
          <Route path="/notepad" element={<ProtectedRoute><NotepadPage /></ProtectedRoute>} />
          <Route path="/study-plan" element={<ProtectedRoute><StudyPlanPage /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><SessionHistoryPage /></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
          <Route path="/mock-exam" element={<ProtectedRoute><MockExam /></ProtectedRoute>} />
          <Route path="/mock-summary" element={<ProtectedRoute><MockSummary /></ProtectedRoute>} />
          <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        <BottomNav />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <StudyProvider>
        <Router>
          <AuthAwareRoutes />
        </Router>
      </StudyProvider>
    </ThemeProvider>
  );
}

export default App;