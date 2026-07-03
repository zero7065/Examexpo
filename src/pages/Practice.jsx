import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getUserProfile } from "../lib/userProfile";
import { getQuestionsFromBank } from "../data/questionBank";
import { generateQuestionsWithAI } from "../lib/questions";
import { ChevronRight, Zap, BookOpen, Loader2, CheckCircle2, Clock } from "lucide-react";

const SUBJECT_MAP = {
  English: "Use of English Language", Maths: "Mathematics", Physics: "Physics",
  Chemistry: "Chemistry", Biology: "Biology", Economics: "Economics",
  Government: "Government", Literature: "Literature in English", CRS: "Christian Religious Studies",
  Geography: "Geography", Commerce: "Commerce", Accounting: "Financial Accounting",
  "Further Maths": "Further Mathematics", "Agricultural Science": "Agricultural Science",
  "Technical Drawing": "Technical Drawing", "Business Management": "Business Management",
};

export default function Practice() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const [profile, setProfile] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(subjectParam || "");
  const [mode, setMode] = useState("practice");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const p = await getUserProfile(user.uid);
        setProfile(p);
        if (!subjectParam && p?.subjects?.length) {
          setSelectedSubject(p.subjects[0]);
        }
      }
    }
    loadProfile();
  }, [user, subjectParam]);

  useEffect(() => {
    if (subjectParam) setSelectedSubject(subjectParam);
  }, [subjectParam]);

  const userSubjects = profile?.subjects || [];

  function getSubjectIcon(name) {
    const icons = {
      English: "📖", Maths: "📐", Physics: "⚛️", Chemistry: "🧪", Biology: "🧬",
      Economics: "📊", Government: "🏛️", Literature: "📚", CRS: "✝️", Geography: "🌍",
      Commerce: "💼", Accounting: "🧾", "Further Maths": "🔢", "Agricultural Science": "🌾",
      "Technical Drawing": "📏", "Business Management": "📋", "Use of English Language": "📖",
      Mathematics: "📐",
    };
    return icons[name] || "📚";
  }

  async function handleStart() {
    if (!selectedSubject) {
      toast({ message: "Please select a subject", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const subjectName = SUBJECT_MAP[selectedSubject] || selectedSubject;
      const questionCount = mode === "cbt" ? 40 : 10;

      let questions = getQuestionsFromBank({
        subject: subjectName,
        exam: profile?.exam || "JAMB",
        count: questionCount,
      });

      if (questions.length === 0) {
        questions = await generateQuestionsWithAI(subjectName, null, questionCount);
      }

      if (questions.length === 0) {
        toast({ message: "No questions available for this subject yet", type: "error" });
        setLoading(false);
        return;
      }

      toast({ message: `Starting ${mode} session 🔥`, type: "success" });
      navigate("/practice", {
        state: {
          exam: profile?.exam || "JAMB",
          mode,
          questions,
          subject: subjectName,
          startTime: Date.now(),
        }
      });
    } catch (e) {
      toast({ message: "Failed to start session", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", padding: "24px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Practice Mode</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>Select a subject and choose your study mode</p>

        {/* Mode Selection */}
        <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, display: "block" }}>Study Mode</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "practice", label: "Free Practice", icon: BookOpen, desc: "Untimed · Learn at your pace" },
              { id: "timed", label: "Timed Mode", icon: Clock, desc: "30 min countdown · Exam pressure" },
              { id: "cbt", label: "CBT Mode", icon: Zap, desc: "40 questions · Full simulation" },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  style={{
                    flex: 1, padding: "16px 12px", borderRadius: 12, cursor: "pointer", textAlign: "center",
                    background: isActive ? "rgba(108,60,233,0.15)" : "#1a1a1f",
                    border: isActive ? "2px solid #6C3CE9" : "1px solid #2a2a35",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={24} color={isActive ? "#6C3CE9" : "#888"} style={{ margin: "0 auto 8px", display: "block" }} />
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : "#ccc" }}>{m.label}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject Selection */}
        <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16, display: "block" }}>Select Subject</label>
          {userSubjects.length === 0 ? (
            <p style={{ color: "#666", fontSize: 13 }}>No subjects found. Complete onboarding to select subjects.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {userSubjects.map((subj) => {
                const isActive = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12,
                      background: isActive ? "rgba(108,60,233,0.15)" : "#1a1a1f",
                      border: isActive ? "2px solid #D4A853" : "1px solid #2a2a35",
                      cursor: "pointer", transition: "all 0.2s", textAlign: "left"
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{getSubjectIcon(subj)}</span>
                    <span style={{ flex: 1, fontWeight: 600, color: isActive ? "#fff" : "#ccc" }}>{subj}</span>
                    {isActive && <CheckCircle2 size={20} color="#D4A853" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary & Start */}
        <div style={{ background: "#121218", border: "1px solid #1e1e2a", borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Session Summary</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Subject</div>
              <div style={{ fontWeight: 600, color: "#fff" }}>{selectedSubject || "Not selected"}</div>
            </div>
            <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Mode</div>
              <div style={{ fontWeight: 600, color: "#fff" }}>{mode === "cbt" ? "CBT Simulation" : mode === "timed" ? "Timed" : "Free Practice"}</div>
            </div>
            <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Questions</div>
              <div style={{ fontWeight: 600, color: "#fff" }}>{mode === "cbt" ? 40 : 10}</div>
            </div>
            <div style={{ background: "#1a1a1f", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>Time</div>
              <div style={{ fontWeight: 600, color: "#fff" }}>{mode === "cbt" ? "60 min" : mode === "timed" ? "30 min" : "Unlimited"}</div>
            </div>
          </div>
          <button
            onClick={handleStart}
            disabled={loading || !selectedSubject}
            style={{
              width: "100%", padding: "16px", borderRadius: 12,
              background: selectedSubject && !loading ? "#6C3CE9" : "#333",
              color: selectedSubject && !loading ? "#fff" : "#666",
              border: "none", fontWeight: 700, fontSize: 16, cursor: selectedSubject && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            {loading ? <Loader2 size={20} style={{ animation: "spin 0.8s linear infinite" }} /> : <><Zap size={20} /> Start Session <ChevronRight size={20} /></>}
          </button>
        </div>

        <button onClick={() => navigate("/dashboard")} style={{
          background: "transparent", border: "1px solid #333", color: "#888", padding: "12px 24px",
          borderRadius: 10, fontWeight: 600, cursor: "pointer", width: "100%"
        }}>
          Back to Dashboard
        </button>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}