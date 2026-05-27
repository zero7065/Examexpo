import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserProfile, getUserProfile } from "../lib/userProfile";
import { useToast } from "../components/Toast";
import { logActivity } from "../lib/activityLog";
import { Check, ChevronRight, Target, GraduationCap, BookOpen, PenTool, ArrowRight } from "lucide-react";

const EXAMS = [
  { id: "jamb", title: "JAMB UTME", subtitle: "University entrance exam · 180 questions · 2hrs", icon: "🎯" },
  { id: "waec", title: "WAEC SSCE", subtitle: "West African senior certificate · May/June or Nov/Dec", icon: "📝" },
  { id: "nabteb", title: "NABTEB", subtitle: "National Business & Technical exams", icon: "🏫" },
  { id: "postutme", title: "POST-UTME", subtitle: "University screening after JAMB", icon: "📚" },
];

const SUBJECTS = {
  jamb: ["English", "Maths", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "CRS", "Geography", "Commerce", "Accounting"],
  waec: ["English", "Maths", "Physics", "Chemistry", "Biology", "Economics", "Government", "Literature", "CRS", "Geography", "Commerce", "Accounting", "Further Maths", "Agricultural Science", "Technical Drawing"],
  nabteb: ["English", "Maths", "Physics", "Chemistry", "Biology", "Economics", "Government", "Technical Drawing", "Business Management"],
  postutme: ["English", "Maths", "Physics", "Chemistry", "Biology", "Economics"],
};

const SUBJECT_ICONS = {
  English: "📖", Maths: "🔢", Physics: "⚛️", Chemistry: "🧪", Biology: "🧬",
  Economics: "💰", Government: "🏛️", Literature: "📚", CRS: "✝️", Geography: "🌍",
  Commerce: "📊", Accounting: "🧾", "Further Maths": "📐", "Agricultural Science": "🌾", "Technical Drawing": "📏",
  "Business Management": "💼",
};

export default function Onboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAlreadyOnboarded() {
      if (!user) { setChecking(false); return; }
      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.onboarded) {
          navigate("/dashboard", { replace: true });
          return;
        }
      } catch (e) {
        // No profile yet - fresh user, allow onboarding
      }
      setChecking(false);
    }
    checkAlreadyOnboarded();
  }, [user, navigate]);

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Loading...
      </div>
    );
  }

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    exam: null,
    subjects: [],
    targetScore: 280,
    targetGrade: "C",
  });
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;
  const subjects = formData.exam ? SUBJECTS[formData.exam] : [];

  function handleExamSelect(exam) {
    setFormData({ ...formData, exam, subjects: [] });
  }

  function handleSubjectToggle(subject) {
    const current = formData.subjects;
    if (current.includes(subject)) {
      setFormData({ ...formData, subjects: current.filter(s => s !== subject) });
    } else {
      setFormData({ ...formData, subjects: [...current, subject] });
    }
  }

  function canProceedStep2() {
    return formData.subjects.length >= 3;
  }

  function getScoreColor(score) {
    if (score < 200) return "#FF4D6A";
    if (score < 250) return "#FF9F43";
    if (score < 320) return "#00E5A0";
    return "#D4A853";
  }

  function getScoreLabel(score) {
    if (score < 200) return "Keep pushing! You can do this 💪";
    if (score < 250) return "Good start! Let's aim higher 🔥";
    if (score < 320) return "That's a competitive score 🔥";
    return "Elite score! You're unstoppable 🚀";
  }

  async function handleComplete() {
    if (!user) return;
    setLoading(true);
    try {
      await createUserProfile(user.uid, {
        exam: formData.exam,
        subjects: formData.subjects,
        targetScore: formData.exam === "jamb" ? formData.targetScore : formData.targetScore,
        targetGrade: formData.exam !== "jamb" ? formData.targetGrade : null,
      });
      logActivity({ action: "onboarding_complete", userId: user.uid, email: user.email, details: { exam: formData.exam, subjects: formData.subjects, targetScore: formData.targetScore } });
      toast({ message: "Profile created! Let's go 🚀", type: "success" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({ message: "Something went wrong. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>

      <div style={{
        background: "#121218",
        border: "1px solid #222",
        borderRadius: 24,
        maxWidth: 520,
        width: "100%",
        padding: "40px 32px",
        position: "relative",
      }}>
        {/* Step indicator */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} style={{
              width: s === step ? 32 : 8,
              height: 8,
              borderRadius: 4,
              background: s <= step ? "#6C3CE9" : "#333",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* Step 1: Choose Exam */}
        {step === 1 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
              Choose Your Exam
            </h2>
            <p style={{ color: "#888", textAlign: "center", marginBottom: 24 }}>
              Select the exam you're preparing for
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {EXAMS.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => handleExamSelect(exam.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    background: formData.exam === exam.id ? "rgba(108,60,233,0.15)" : "#1a1a1f",
                    border: formData.exam === exam.id ? "2px solid #D4A853" : "1px solid #2a2a35",
                    borderRadius: 16,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: 24 }}>{exam.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>{exam.title}</div>
                    <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>{exam.subtitle}</div>
                  </div>
                  {formData.exam === exam.id && <Check size={20} color="#D4A853" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!formData.exam}
              style={{
                marginTop: 24,
                width: "100%",
                padding: "14px 24px",
                background: formData.exam ? "#6C3CE9" : "#333",
                color: formData.exam ? "#fff" : "#666",
                border: "none",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                cursor: formData.exam ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s ease",
              }}
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Pick Subjects */}
        {step === 2 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
              Pick Your Subjects
            </h2>
            <p style={{ color: "#888", textAlign: "center", marginBottom: 24 }}>
              Select at least 3 subjects for {formData.exam?.toUpperCase()}
            </p>
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              maxHeight: 280,
              overflowY: "auto",
              paddingRight: 8,
              className: "scrollbar-thin",
            }}>
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle(subject)}
                  style={{
                    padding: "10px 16px",
                    background: formData.subjects.includes(subject) ? "#6C3CE9" : "#1a1a1f",
                    border: formData.subjects.includes(subject) ? "1px solid #6C3CE9" : "1px solid #2a2a35",
                    borderRadius: 20,
                    color: formData.subjects.includes(subject) ? "#fff" : "#ccc",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>{SUBJECT_ICONS[subject] || "📚"}</span>
                  {subject}
                  {formData.subjects.includes(subject) && <Check size={14} />}
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 16, color: formData.subjects.length >= 3 ? "#00E5A0" : "#666", fontSize: 14 }}>
              {formData.subjects.length} selected
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "transparent",
                  border: "1px solid #333",
                  borderRadius: 12,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2()}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: canProceedStep2() ? "#6C3CE9" : "#333",
                  color: canProceedStep2() ? "#fff" : "#666",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: canProceedStep2() ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Target Score */}
        {step === 3 && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
              Set Your Target
            </h2>
            <p style={{ color: "#888", textAlign: "center", marginBottom: 32 }}>
              {formData.exam === "jamb" ? "What's your target JAMB score?" : "What's your target grade?"}
            </p>

            {formData.exam === "jamb" ? (
              <div style={{ padding: "0 12px" }}>
                <div style={{
                  fontSize: 72,
                  fontWeight: 800,
                  textAlign: "center",
                  color: getScoreColor(formData.targetScore),
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  {formData.targetScore}
                </div>
                <input
                  type="range"
                  min="150"
                  max="400"
                  value={formData.targetScore}
                  onChange={(e) => setFormData({ ...formData, targetScore: parseInt(e.target.value) })}
                  style={{
                    width: "100%",
                    height: 8,
                    borderRadius: 4,
                    appearance: "none",
                    background: `linear-gradient(to right, #FF4D6A 0%, #FF9F43 33%, #00E5A0 66%, #D4A853 100%)`,
                    cursor: "pointer",
                    outline: "none",
                  }}
                />
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    background: #fff;
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  }
                `}</style>
                <p style={{
                  textAlign: "center",
                  marginTop: 16,
                  color: getScoreColor(formData.targetScore),
                  fontSize: 14,
                  fontWeight: 500,
                }}>
                  {getScoreLabel(formData.targetScore)}
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                padding: "0 12px",
              }}>
                {["A", "B", "C", "D", "E", "F"].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setFormData({ ...formData, targetGrade: grade })}
                    style={{
                      padding: "16px",
                      background: formData.targetGrade === grade ? "rgba(108,60,233,0.15)" : "#1a1a1f",
                      border: formData.targetGrade === grade ? "2px solid #6C3CE9" : "1px solid #2a2a35",
                      borderRadius: 12,
                      color: formData.targetGrade === grade ? "#fff" : "#ccc",
                      fontSize: 20,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {grade}
                    <div style={{ fontSize: 10, fontWeight: 400, marginTop: 4, color: "#666" }}>
                      {grade === "A" ? "Excellent" : grade === "B" ? "Very Good" : grade === "C" ? "Good" : grade === "D" ? "Pass" : "Needs Work"}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "transparent",
                  border: "1px solid #333",
                  borderRadius: 12,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  flex: 1,
                  padding: "14px 24px",
                  background: "#6C3CE9",
                  color: "#fff",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Welcome */}
        {step === 4 && (
          <div style={{ animation: "fadeIn 0.4s ease", textAlign: "center" }}>
            <div style={{
              width: 100,
              height: 100,
              margin: "0 auto 24px",
              background: "linear-gradient(135deg, #6C3CE9 0%, #D4A853 100%)",
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <BookOpen size={48} color="#fff" />
            </div>
            <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              You're all set, {user?.displayName?.split(" ")[0] || "Student"} 🚀
            </h2>
            <p style={{ color: "#888", fontSize: 16, marginBottom: 8 }}>
              Your personalized study plan is ready.
            </p>
            <p style={{ color: "#6C3CE9", fontSize: 18, fontWeight: 600, marginBottom: 32 }}>
              Let's crush that {formData.exam === "jamb" ? `${formData.targetScore} score` : `${formData.targetGrade} grade`}!
            </p>
            <button
              onClick={handleComplete}
              disabled={loading}
              style={{
                padding: "16px 32px",
                background: "linear-gradient(135deg, #D4A853 0%, #B8933F 100%)",
                color: "#0a0a0f",
                border: "none",
                borderRadius: 14,
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "all 0.2s ease",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Setting up..." : "Enter Dashboard →"}
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}