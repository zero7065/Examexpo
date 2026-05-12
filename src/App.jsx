// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { StudyProvider } from "./context/StudyContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import SubjectSelector from "./pages/SubjectSelector";
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
import AITutorPage from "./pages/AITutorPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import NotFoundPage from "./pages/NotFoundPage";
import InstallPrompt from "./components/InstallPrompt";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <StudyProvider>
            <Router>
              <div className="flex flex-col md:flex-row min-h-screen bg-bg text-text selection:bg-primary/30">
                <Navbar />
                <main className="flex-1 md:ml-64 pb-20 md:pb-0">
                <InstallPrompt />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/select" element={<ProtectedRoute><SubjectSelector /></ProtectedRoute>} />
                    <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
                    <Route path="/cbt" element={<ProtectedRoute requiresPro><CBTSimulator /></ProtectedRoute>} />
                    <Route path="/result" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />
                    <Route path="/stats" element={<ProtectedRoute requiresPro><StatsPage /></ProtectedRoute>} />
                    <Route path="/past-questions" element={<ProtectedRoute><PastQuestionsPage /></ProtectedRoute>} />
                    <Route path="/notepad" element={<ProtectedRoute><NotepadPage /></ProtectedRoute>} />
                    <Route path="/study-plan" element={<ProtectedRoute requiresPro><StudyPlanPage /></ProtectedRoute>} />
                    <Route path="/history" element={<ProtectedRoute><SessionHistoryPage /></ProtectedRoute>} />
                    <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
                    <Route path="/ai-tutor" element={<ProtectedRoute><AITutorPage /></ProtectedRoute>} />
                    <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
                    <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                    <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    {/* 404 - Redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </Router>
          </StudyProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
