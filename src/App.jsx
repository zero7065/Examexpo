import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { StudyProvider } from "./context/StudyContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import ScrollToTop from "./components/ScrollToTop";
import InstallPrompt from "./components/InstallPrompt";
import { useAuth } from "./context/AuthContext";

// Pages
import AuthPage from "./pages/AuthPage";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import SubjectSelector from "./pages/SubjectSelector";
import Practice from "./pages/Practice";
import QuizPage from "./pages/QuizPage";
import CBTSimulator from "./pages/CBTSimulator";
import ResultPage from "./pages/ResultPage";
import StatsPage from "./pages/StatsPage";
import PastQuestionsPage from "./pages/PastQuestionsPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProfilePage from "./pages/ProfilePage";
import NotepadPage from "./pages/NotepadPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import SessionHistoryPage from "./pages/SessionHistoryPage";
import HelpPage from "./pages/HelpPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import QuestionBank from "./pages/QuestionBank";
import PracticeSession from "./pages/PracticeSession";
import SessionSummary from "./pages/SessionSummary";
import MockExam from "./pages/MockExam";
import MockSummary from "./pages/MockSummary";
import AITutor from "./pages/AITutor";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import NotFoundPage from "./pages/NotFoundPage";

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
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <InstallPrompt />
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