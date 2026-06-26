// src/pages/StudyPlanPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { generateStudyPlan } from "../groq";
import { BookOpen, Target, Calendar, Clock, CheckCircle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudyPlanPage = () => {
  const { user, isPro, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [targetScore, setTargetScore] = useState(300);
  const [examDate, setExamDate] = useState("");
  const [completedTopics, setCompletedTopics] = useState([]);

  const proStatus = isPro();

  useEffect(() => {
    // Load any saved study plan
    const savedPlan = localStorage.getItem(`ep-study-plan-${user?.email}`);
    if (savedPlan) {
      try {
        setStudyPlan(JSON.parse(savedPlan));
      } catch (e) {}
    }
  }, [user]);

  const generatePlan = async () => {
    if (!targetScore || !examDate) {
      toast({ message: "Please enter target score and exam date", type: "warning" });
      return;
    }
    
    setLoading(true);
    try {
      const plan = await generateStudyPlan({
        targetScore,
        examDate,
        currentLevel: user?.totalSessions || 0,
        weakTopics: ["Quadratic Equations", "Organic Chemistry", "Verbs"] // Would come from actual analysis
      });
      
      // Save plan
      setStudyPlan(plan);
      localStorage.setItem(`ep-study-plan-${user?.email}`, JSON.stringify(plan));
      
      // Also save exam date to user profile
      if (updateUser) {
        updateUser({ examDate });
      }
      toast({ message: "Your personalized study plan is ready!", type: "success" });
    } catch (err) {
      toast({ message: "Could not generate plan. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const markTopicComplete = (topic) => {
    if (!completedTopics.includes(topic)) {
      setCompletedTopics([...completedTopics, topic]);
      toast({ message: `Completed: ${topic}`, type: "success" });
    }
  };

  if (!proStatus) {
    // Free users get a preview
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10 animate-fade">
        <header className="text-center">
          <h1 className="text-4xl font-black mb-2">AI Study Plan Preview</h1>
          <p className="text-text-muted">See what a personalized plan can do for your score</p>
        </header>

        <div className="glass-card p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-primary/10 rounded-2xl">
              <div className="text-3xl font-black text-primary mb-2">7+</div>
              <div className="text-sm text-text-muted">Days of Study</div>
            </div>
            <div className="p-6 bg-accent/10 rounded-2xl">
              <div className="text-3xl font-black text-accent mb-2">50+</div>
              <div className="text-sm text-text-muted">Topics Covered</div>
            </div>
            <div className="p-6 bg-primary/10 rounded-2xl">
              <div className="text-3xl font-black text-blue-500 mb-2">300+</div>
              <div className="text-sm text-text-muted">Target Score</div>
            </div>
          </div>

          <div className="text-center py-6">
            <h3 className="text-xl font-bold mb-4">What you'll get with Pro:</h3>
            <ul className="text-left max-w-md mx-auto space-y-3 text-text-muted">
              <li>✅ Personalized day-by-day schedule</li>
              <li>✅ AI analysis of your weak areas</li>
              <li>✅ Topic-by-topic coverage plan</li>
              <li>✅ Practice task breakdown</li>
            </ul>
          </div>

          <button onClick={() => navigate("/payment")} className="btn-primary w-full py-4 text-lg">
            Unlock AI Study Plan - ₦3,000/mo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10 animate-fade">
      <header className="text-center">
        <h1 className="text-4xl font-black mb-2">Your AI Study Plan</h1>
        <p className="text-text-muted font-medium">
          Personalized schedule to help you achieve your target score
        </p>
      </header>

      {!studyPlan ? (
        <div className="glass-card p-10 max-w-2xl mx-auto">
          <div className="space-y-8">
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-text-muted block mb-3">
                Target JAMB Score
              </label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="180" 
                  max="400" 
                  value={targetScore} 
                  onChange={(e) => setTargetScore(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="text-3xl font-black text-primary w-20 text-center">{targetScore}</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-text-muted block mb-3">
                Exam Date
              </label>
              <input 
                type="date" 
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="input-field"
              />
            </div>

            <button 
              onClick={generatePlan}
              disabled={loading || !targetScore || !examDate}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
              Generate My Study Plan
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Plan Overview */}
          <div className="glass-card p-8 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Target className="text-primary" size={32} />
              </div>
              <div>
                <div className="text-sm text-text-muted font-bold uppercase">Target Score</div>
                <div className="text-3xl font-black">{targetScore}+ Points</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
                <Calendar className="text-accent" size={32} />
              </div>
              <div>
                <div className="text-sm text-text-muted font-bold uppercase">Days to Prepare</div>
                <div className="text-3xl font-black">{studyPlan.totalDays || 30} Days</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="text-blue-500" size={32} />
              </div>
              <div>
                <div className="text-sm text-text-muted font-bold uppercase">Topics to Cover</div>
                <div className="text-3xl font-black">{studyPlan.topics?.length || 0}</div>
              </div>
            </div>
          </div>

          {/* Study Schedule */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Clock className="text-primary" size={24} />
              Your Daily Schedule
            </h2>
            
            {studyPlan.topics?.map((item, index) => (
              <div 
                key={index} 
                className={`glass-card p-6 border-2 transition-all ${
                  completedTopics.includes(item.topic) 
                    ? "border-success/30 bg-success/5" 
                    : "border-transparent hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-primary/20 text-primary text-xs font-black px-3 py-1 rounded-full">
                        Day {index + 1}
                      </span>
                      <span className="text-text-muted text-sm">{item.duration}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.topic}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{item.description}</p>
                    
                    {item.exercises && (
                      <div className="mt-4 p-4 bg-white/5 rounded-xl">
                        <div className="text-xs font-black uppercase text-text-muted mb-2">Practice Tasks</div>
                        <ul className="space-y-2">
                          {item.exercises.map((ex, i) => (
                            <li key={i} className="text-sm text-text flex items-center gap-2">
                              <ArrowRight size={14} className="text-primary" />
                              {ex}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => markTopicComplete(item.topic)}
                    disabled={completedTopics.includes(item.topic)}
                    className={`p-3 rounded-xl transition-all ${
                      completedTopics.includes(item.topic)
                        ? "bg-success/20 text-success"
                        : "bg-white/5 text-text-muted hover:bg-primary/20 hover:text-primary"
                    }`}
                  >
                    {completedTopics.includes(item.topic) ? (
                      <CheckCircle size={24} />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-current" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button 
              onClick={() => { setStudyPlan(null); setCompletedTopics([]); }}
              className="btn-secondary flex-1"
            >
              Create New Plan
            </button>
            <button 
              onClick={() => navigate("/select")}
              className="btn-primary flex-1"
            >
              Start Practicing Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanPage;