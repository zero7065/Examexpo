// src/pages/SessionHistoryPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { History, ChevronRight, Calendar, Clock, Target, BookOpen, Search } from "lucide-react";

const SessionHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    // Load sessions from localStorage (since Firestore might not have all)
    const savedSessions = localStorage.getItem(`ep-sessions-${user?.email}`);
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {}
    }
    setLoading(false);
  }, [user]);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 50) return "text-accent";
    return "text-danger";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary font-bold text-xl">Loading your history...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10 animate-fade">
      <header>
        <h1 className="text-4xl font-black mb-2">Your Study History</h1>
        <p className="text-text-muted font-medium">
          Review all your practice sessions, track your progress over time
        </p>
      </header>

      {sessions.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <History className="text-text-muted" size={40} />
          </div>
          <h2 className="text-2xl font-black mb-4">No Sessions Yet</h2>
          <p className="text-text-muted mb-8 max-w-md mx-auto">
            You haven't completed any practice sessions yet. Start your first session to build your history.
          </p>
          <button onClick={() => navigate("/select")} className="btn-primary px-8 py-4">
            Start Practicing
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black flex items-center gap-3">
              <BookOpen className="text-primary" size={24} />
              Past Sessions ({sessions.length})
            </h2>
            
            {sessions.map((session, index) => (
              <div 
                key={index}
                onClick={() => setSelectedSession(session)}
                className={`glass-card p-6 cursor-pointer hover:border-primary/30 transition-all ${
                  selectedSession?.index === index ? "border-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-lg mb-1">{session.exam} - {session.mode}</div>
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(session.completedAt || new Date().toISOString())}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(session.timeSpentSeconds || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-black ${getScoreColor(session.percentageScore)}`}>
                      {Math.round(session.percentageScore)}%
                    </div>
                    <div className="text-xs text-text-muted font-bold">
                      {session.correctAnswers}/{session.totalQuestions} correct
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {session.subjects?.slice(0, 3).map((s, i) => (
                      <span key={i} className="bg-white/5 text-text-muted text-xs px-3 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                  <ChevronRight className="text-text-muted" size={20} />
                </div>
              </div>
            ))}
          </div>

          {/* Session Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-black">Session Details</h3>
            
            {selectedSession ? (
              <div className="glass-card p-6 space-y-6">
                <div className="text-center border-b border-border pb-6">
                  <div className="text-5xl font-black mb-2 text-primary">
                    {Math.round(selectedSession.percentageScore)}%
                  </div>
                  <div className="text-text-muted">
                    Score: {selectedSession.score} / 400
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Questions</span>
                    <span className="font-bold">{selectedSession.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Correct</span>
                    <span className="font-bold text-success">{selectedSession.correctAnswers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Wrong</span>
                    <span className="font-bold text-danger">
                      {selectedSession.totalQuestions - selectedSession.correctAnswers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Time Spent</span>
                    <span className="font-bold">{formatTime(selectedSession.timeSpentSeconds || 0)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate("/result", { state: { result: selectedSession } })}
                  className="btn-primary w-full"
                >
                  View Full Review
                </button>

                {selectedSession.questionLog && (
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="text-sm font-bold text-text-muted mb-3">Question Breakdown</div>
                    {selectedSession.questionLog.slice(0, 5).map((q, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Q{i + 1}</span>
                        <span className={q.isCorrect ? "text-success" : "text-danger"}>
                          {q.isCorrect ? "✓" : "✗"}
                        </span>
                      </div>
                    ))}
                    {selectedSession.questionLog.length > 5 && (
                      <div className="text-xs text-text-muted text-center pt-2">
                        + {selectedSession.questionLog.length - 5} more questions
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-text-muted">
                <Target size={40} className="mx-auto mb-4 opacity-50" />
                <p>Click on a session to see details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionHistoryPage;