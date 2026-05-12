// src/pages/QuizPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "../context/StudyContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { explainAnswer } from "../groq";
import { checkAndIncrementUsage, checkAndIncrementAILimit } from "../utils/dailyUsage";
import ProgressBar from "../components/ProgressBar";
import Timer from "../components/Timer";
import ShareQuestion from "../components/ShareQuestion";
import { ChevronRight, Flag, Sparkles, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const QuizPage = () => {
  const { currentSession, submitAnswer, nextQuestion, saveSessionToFirestore } = useStudy();
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!currentSession) {
      navigate("/select");
      return;
    }
    // Small delay to ensure session is fully initialized
    const timer = setTimeout(() => {
      setIsReady(true);
      const totalTime = 30 * 60;
      setTimeLeft(totalTime);
    }, 100);
    return () => clearTimeout(timer);
  }, [currentSession, navigate]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-primary font-bold text-xl">Loading questions...</div>
      </div>
    );
  }

  if (!currentSession) return null;

  const currentQuestion = currentSession.questions[currentSession.currentQuestionIndex];
  const isLastQuestion = currentSession.currentQuestionIndex === currentSession.questions.length - 1;

  const handleCheck = async () => {
    if (!selectedOption) return;

    const proStatus = isPro();

    const usage = await checkAndIncrementUsage(user.uid, proStatus);
    if (!usage.allowed) {
      toast({ message: `Daily question limit (${usage.limit}) reached. Upgrade to Pro!`, type: "warning" });
      navigate("/payment");
      return;
    }

    setIsChecked(true);
    submitAnswer(currentSession.currentQuestionIndex, selectedOption);
    
    setLoadingExplanation(true);
    try {
      const aiLimit = await checkAndIncrementAILimit(user.uid, proStatus);
      if (!aiLimit.allowed) {
        setExplanation(`AI Explanations limit (${aiLimit.limit}/day) reached. Upgrade to Pro for unlimited AI Tutor.`);
      } else {
        const exp = await explainAnswer({
          question: currentQuestion.question,
          options: currentQuestion.options,
          userAnswer: currentQuestion.options[selectedOption],
          correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
          subject: typeof currentQuestion.subject === 'object' ? currentQuestion.subject.name : currentQuestion.subject,
          exam: currentSession.exam
        });
        setExplanation(exp);
      }
    } catch (err) {
      setExplanation("Could not load AI explanation. " + currentQuestion.explanation);
      toast({ message: "AI Explanation failed to load", type: "warning" });
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinish();
    } else {
      setSelectedOption(null);
      setIsChecked(false);
      setExplanation("");
      nextQuestion();
    }
  };

  const handleFinish = async () => {
    const correctAnswers = currentSession.questions.filter((q, i) => {
      const userAnswer = i === currentSession.currentQuestionIndex ? selectedOption : currentSession.answers[i];
      return userAnswer === q.correctAnswer;
    }).length;

    const result = {
      exam: currentSession.exam,
      mode: currentSession.mode,
      subjects: currentSession.subjects.map(s => s.id),
      totalQuestions: currentSession.questions.length,
      correctAnswers,
      score: (correctAnswers / currentSession.questions.length) * 400,
      percentageScore: (correctAnswers / currentSession.questions.length) * 100,
      timeSpentSeconds: (30 * 60) - timeLeft,
      questionLog: currentSession.questions.map((q, i) => ({
        questionId: q.id,
        question: q.question,
        options: q.options,
        subject: q.subject,
        userAnswer: i === currentSession.currentQuestionIndex ? selectedOption : currentSession.answers[i],
        correctAnswer: q.correctAnswer,
        isCorrect: (i === currentSession.currentQuestionIndex ? selectedOption : currentSession.answers[i]) === q.correctAnswer,
        topic: q.topic,
        explanation: q.explanation
      }))
    };

    await saveSessionToFirestore(user.uid, result);
    
    // Also save to localStorage for history tracking
    const existingSessions = localStorage.getItem(`ep-sessions-${user.email}`);
    const sessions = existingSessions ? JSON.parse(existingSessions) : [];
    sessions.unshift({ ...result, completedAt: new Date().toISOString() });
    localStorage.setItem(`ep-sessions-${user.email}`, JSON.stringify(sessions.slice(0, 50))); // Keep last 50
    
    toast({ message: "Session saved! Check your history for review.", type: "success" });
    navigate("/result", { state: { result } });
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:-ml-64 md:fixed md:inset-0 md:z-[100] animate-fade">
      {/* Top Header */}
      <div className="bg-bg-2 border-b border-border px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-black">E</div>
          <div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">Question {currentSession.currentQuestionIndex + 1} of {currentSession.questions.length}</div>
            <div className="text-sm font-bold text-text">{typeof currentQuestion.subject === 'object' ? currentQuestion.subject.name : currentQuestion.subject}</div>
          </div>
        </div>

        <div className="hidden md:block w-full max-w-xs mx-8">
          <ProgressBar current={currentSession.currentQuestionIndex + 1} total={currentSession.questions.length} />
        </div>

        <div className="flex items-center gap-4">
          <Timer initialSeconds={timeLeft} onTimeUp={handleFinish} />
          <button 
            onClick={() => { if(window.confirm("Quit session? Progress will be lost.")) navigate("/dashboard") }} 
            className="text-text-muted hover:text-danger transition-colors text-xs font-bold uppercase tracking-widest"
          >
            Quit
          </button>
        </div>
      </div>

      {/* Main content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="glass-card p-10 space-y-10 border-2 border-transparent">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-text-muted bg-white/5 px-3 py-1 rounded-lg">
                {currentQuestion.topic}
              </span>
              <button className="text-text-muted hover:text-accent transition-colors">
                <Flag size={20} />
              </button>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold leading-tight text-text">
              {currentQuestion.question}
            </h2>

            <div className="grid gap-4">
              {Object.entries(currentQuestion.options).map(([key, value]) => {
                let statusClass = "border-border hover:border-text-muted bg-bg-3";
                if (selectedOption === key) statusClass = "border-primary bg-primary-dim ring-1 ring-primary";
                if (isChecked) {
                  if (key === currentQuestion.correctAnswer) statusClass = "border-success bg-success/10 ring-2 ring-success";
                  else if (selectedOption === key) statusClass = "border-danger bg-danger/10 ring-2 ring-danger opacity-80";
                  else statusClass = "border-border opacity-40";
                }

                return (
                  <button
                    key={key}
                    disabled={isChecked}
                    onClick={() => {
                      setSelectedOption(key);
                    }}
                    className={`flex items-center gap-6 p-6 rounded-2xl border transition-all text-left group ${statusClass}`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl transition-colors ${
                      selectedOption === key ? 'bg-primary text-black' : 'bg-white/5 text-text-muted group-hover:bg-white/10'
                    }`}>
                      {key}
                    </div>
                    <div className="font-bold text-lg flex-1">{value}</div>
                    {isChecked && key === currentQuestion.correctAnswer && <CheckCircle2 className="text-success" size={28} />}
                    {isChecked && selectedOption === key && key !== currentQuestion.correctAnswer && <AlertCircle className="text-danger" size={28} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Explanation Area */}
          {isChecked && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="glass-card p-10 border-primary/20 bg-primary-dim relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <Sparkles className="text-primary animate-pulse" size={24} />
                </div>
                
                <h4 className="text-primary font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                  <Sparkles size={16} />
                  AI Tutor Explanation
                </h4>
                
                {loadingExplanation ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-primary/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-primary/20 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-primary/20 rounded w-5/6 animate-pulse"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-text leading-relaxed font-bold italic text-lg">
                      "{explanation}"
                    </p>
                    <div className="h-px bg-primary/20 w-full"></div>
                    <ShareQuestion 
                      question={currentQuestion.question}
                      options={currentQuestion.options}
                      correctAnswer={currentQuestion.correctAnswer}
                      explanation={explanation}
                      subject={currentQuestion.subject}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom bar */}
      <div className="bg-bg-2 border-t border-border p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-text-muted text-xs font-black uppercase tracking-widest hidden sm:block">
            {isLastQuestion ? "Final Question" : "Keep going, you're doing great!"}
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            {!isChecked ? (
              <button 
                onClick={handleCheck}
                disabled={!selectedOption}
                className="btn-primary w-full sm:px-12 flex items-center gap-2 disabled:opacity-50 disabled:grayscale shadow-xl shadow-primary/20"
              >
                Check Answer
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="btn-primary w-full sm:px-12 flex items-center gap-2 bg-indigo-500 text-white shadow-xl shadow-indigo-500/20"
              >
                {isLastQuestion ? "View Results" : "Next Question"}
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
