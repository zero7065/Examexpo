// src/pages/CBTSimulator.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Timer from "../components/Timer";
import ProGate from "../components/ProGate";
import { ChevronLeft, ChevronRight, Flag, Send, AlertCircle, Monitor, BookOpen } from "lucide-react";

const CBTSimulator = () => {
  const { currentSession, submitAnswer, saveSessionToFirestore } = useStudy();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flagged, setFlagged] = useState(new Set());
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    if (!currentSession || currentSession.mode !== "cbt") {
      navigate("/select?mode=cbt");
      return;
    }
    toast({ message: "CBT Simulation active. Good luck! 🖥️", type: "success" });
  }, [currentSession, navigate, toast]);

  if (!currentSession) return null;

  const isPro = user?.plan === "pro" && user?.planExpiry && new Date(user.planExpiry) > new Date();
  if (!isPro) return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <ProGate feature="Full CBT Simulation" />
    </div>
  );

  const currentQuestion = currentSession.questions[currentIndex];

  const handleOptionSelect = (option) => {
    const newAnswers = { ...answers, [currentIndex]: option };
    setAnswers(newAnswers);
    submitAnswer(currentIndex, option);
    toast({ message: `Answer marked for Q${currentIndex + 1}`, type: "info" });
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentIndex)) newFlagged.delete(currentIndex);
    else newFlagged.add(currentIndex);
    setFlagged(newFlagged);
  };

  const handleFinish = async () => {
    if (!window.confirm("Are you sure you want to submit your exam?")) return;

    const correctAnswers = currentSession.questions.filter((q, i) => answers[i] === q.correctAnswer).length;

    const result = {
      exam: currentSession.exam,
      mode: "cbt",
      subjects: currentSession.subjects.map(s => s.id),
      totalQuestions: currentSession.questions.length,
      correctAnswers,
      score: (correctAnswers / currentSession.questions.length) * 400,
      percentageScore: (correctAnswers / currentSession.questions.length) * 100,
      timeSpentSeconds: 120 * 60, // Fixed for CBT
      questions: currentSession.questions,
      questionLog: currentSession.questions.map((q, i) => ({
        questionId: q.id,
        subject: q.subject,
        userAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: answers[i] === q.correctAnswer,
        topic: q.topic
      }))
    };

    await saveSessionToFirestore(user.id, result);
    navigate("/result", { state: { result } });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:-ml-64 md:fixed md:inset-0 md:z-[100] font-sora selection:bg-primary/30">
      {/* Top Header - Exam Info */}
      <div className="bg-bg-2 border-b border-border flex items-center justify-between px-8 py-3 shadow-lg z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-black">E</div>
            <div>
              <div className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">CBT Simulation</div>
              <div className="text-sm font-black text-text">{currentSession.exam} 2025 UTME</div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
            {currentSession.subjects.map((s, i) => (
              <span key={s.id} className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${i === 0 ? 'bg-primary text-black' : 'text-text-muted'}`}>
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Time Remaining</div>
            <Timer initialSeconds={120 * 60} onTimeUp={handleFinish} />
          </div>
          <button 
            onClick={handleFinish} 
            className="btn-primary bg-danger text-white hover:bg-red-600 px-8 h-12 flex items-center gap-3 shadow-xl shadow-danger/20"
          >
            <Send size={18} />
            Submit
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 overflow-y-auto p-10 md:p-20 bg-bg relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
            <h1 className="text-[20vw] font-black -rotate-12">EXAMPADI</h1>
          </div>

          <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-text-muted">
                <Monitor size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Question {currentIndex + 1} of {currentSession.questions.length}</span>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <BookOpen size={18} />
                <span className="text-xs font-black uppercase tracking-widest">{typeof currentQuestion.subject === 'object' ? currentQuestion.subject.name : currentQuestion.subject}</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black leading-tight text-text">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => handleOptionSelect(key)}
                  className={`flex items-center gap-8 p-8 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${
                    answers[currentIndex] === key 
                    ? 'border-primary bg-primary-dim shadow-xl shadow-primary/10' 
                    : 'border-border bg-bg-2 hover:border-text-muted'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${
                    answers[currentIndex] === key ? 'bg-primary text-black' : 'bg-bg-3 text-text-muted group-hover:bg-border'
                  }`}>
                    {key}
                  </div>
                  <div className="font-bold text-xl flex-1 text-text">{value}</div>
                  
                  {answers[currentIndex] === key && (
                    <div className="absolute right-0 top-0 h-full w-1.5 bg-primary"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Navigation Sidebar */}
        <div className="w-96 bg-bg-2 border-l border-border p-8 overflow-y-auto hidden lg:flex flex-col">
          <h3 className="font-black text-xs uppercase tracking-widest text-text-muted mb-8 flex items-center gap-2">
            <Monitor size={14} />
            Question Palette
          </h3>

          <div className="grid grid-cols-5 gap-3">
            {currentSession.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setCurrentIndex(i);
                  toast({ message: `Viewing Q${i+1}`, type: "info" });
                }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all border-2 ${
                  currentIndex === i ? 'ring-4 ring-primary/20 scale-110' : ''
                } ${
                  flagged.has(i) ? 'bg-accent text-black border-accent' :
                  answers[i] ? 'bg-primary text-black border-primary' : 'bg-bg-3 text-text-muted border-border hover:border-text-muted'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-12 space-y-4 pt-12 border-t border-border">
            <div className="flex items-center justify-between p-4 bg-bg-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs font-black uppercase tracking-widest text-text-muted">Answered</span>
              </div>
              <span className="font-black font-mono">{Object.keys(answers).length}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-bg-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-xs font-black uppercase tracking-widest text-text-muted">Flagged</span>
              </div>
              <span className="font-black font-mono">{flagged.size}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-bg-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-border rounded-full"></div>
                <span className="text-xs font-black uppercase tracking-widest text-text-muted">Total</span>
              </div>
              <span className="font-black font-mono">{currentSession.questions.length}</span>
            </div>
          </div>

          <div className="mt-auto p-6 bg-primary-dim rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
              <AlertCircle size={14} /> Exam Mode
            </div>
            <p className="text-[10px] font-bold text-text-muted leading-relaxed italic">
              AI Tutor is disabled during CBT Simulation. Your results will be analyzed after submission.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-bg-2 border-t border-border px-10 py-6 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <button 
          onClick={toggleFlag}
          className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${flagged.has(currentIndex) ? 'text-accent' : 'text-text-muted hover:text-text'}`}
        >
          <Flag size={20} fill={flagged.has(currentIndex) ? 'currentColor' : 'none'} />
          {flagged.has(currentIndex) ? 'Unflag Question' : 'Flag for Review'}
        </button>

        <div className="flex gap-4">
          <button 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(prev => prev - 1)}
            className="btn-secondary h-14 px-10 flex items-center gap-3 disabled:opacity-20"
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          <button 
            disabled={currentIndex === currentSession.questions.length - 1}
            onClick={() => setCurrentIndex(prev => prev + 1)}
            className="btn-primary h-14 px-10 flex items-center gap-3 disabled:opacity-20 shadow-xl shadow-primary/20"
          >
            Next Question
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CBTSimulator;
