import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useSubscription } from "../hooks/useSubscription";
import { getUserProfile } from "../lib/userProfile";
import { chatWithTutor, getLastAIError, isAIConfigured } from "../lib/ai";
import { checkAILimit, trackAIMessage } from "../lib/usageTracker";
import { logActivity } from "../lib/activityLog";
import ProUpgradeModal from "../components/ProUpgradeModal";
import { Send, Sparkles, Bot, Plus, ChevronRight } from "lucide-react";

const QUICK_PROMPTS = [
  "Explain Newton's Laws of Motion",
  "What topics appear most in JAMB Biology?",
  "Create a study plan for Physics",
  "Summarize Organic Chemistry for WAEC",
];

function genId() { return `chat_${Date.now()}`; }

export default function AITutor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isPro } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSubject, setActiveSubject] = useState("General");
  const [conversationId, setConversationId] = useState(genId());
  const [showProModal, setShowProModal] = useState(false);
  const [aiUsage, setAiUsage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const initialMessage = location.state?.initialMessage;

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(setProfile).catch(() => {});
    if (user && !isPro) {
      checkAILimit(user.uid).then(l => setAiUsage({ used: l.used, limit: l.limit })).catch(() => {});
    }
  }, [user, isPro]);

  const userSubjects = profile?.subjects || [];

  // Restore chat from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ep-chat-${conversationId}`);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, [conversationId]);

  // Auto-send initial message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      handleSend(initialMessage);
    }
  }, [initialMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save to localStorage
  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(`ep-chat-${conversationId}`, JSON.stringify(messages));
  }, [messages]);

  function handleNewChat() {
    const id = genId();
    setConversationId(id);
    setMessages([]);
    localStorage.removeItem(`ep-chat-${conversationId}`);
  }

  async function handleSend(text) {
    const msg = text || input;
    if (!msg.trim() || loading) return;

    try {
      // Free-tier daily AI limit
      if (!isPro && user) {
        const limit = await checkAILimit(user.uid);
        setAiUsage({ used: limit.used, limit: limit.limit });
        if (!limit.allowed) { setShowProModal(true); return; }
      }

      const userMsg = { id: Date.now(), role: "user", content: msg.trim(), timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      if (user && !isPro) {
        trackAIMessage(user.uid);
        setAiUsage(prev => prev ? { ...prev, used: prev.used + 1 } : prev);
      }

      const allMsgs = [...messages, userMsg];
      const response = await chatWithTutor({
        messages: allMsgs,
        subject: activeSubject,
        userProfile: { name: user?.displayName || "Student", exam: profile?.exam || "JAMB", targetScore: profile?.targetScore || 300 },
      });

      const aiErr = getLastAIError();
      const content = aiErr && Date.now() - aiErr.time < 15000
        ? `⚠️ AI request failed: ${aiErr.message}`
        : response;

      const aiMsg = { id: Date.now() + 1, role: "ai", content, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);

      if (aiErr && Date.now() - aiErr.time < 15000) {
        toast({ message: `AI failed: ${aiErr.message}`, type: "error" });
      }

      logActivity({ action: "ai_chat", userId: user?.uid, email: user?.email, details: { subject: activeSubject, questionLength: msg.trim().length } });
    } catch (e) {
      console.error("AI chat failed:", e);
      toast({ message: "Failed to get AI response. Please try again.", type: "error" });
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"; }
  }, [input]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "#0d0d12", borderBottom: "1px solid #1e1e2a", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6C3CE9, #D4A853)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={16} color="#fff" /></div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>AI Tutor</span>
          {isPro && <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A853", background: "rgba(212,168,83,0.15)", padding: "2px 8px", borderRadius: 6 }}>PRO</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isPro && aiUsage && (
            <span style={{ fontSize: 11, fontWeight: 700, color: aiUsage.used >= aiUsage.limit ? "#ef4444" : "#888", background: "#1a1a1f", border: "1px solid #333", padding: "4px 10px", borderRadius: 6 }}>
              AI {aiUsage.used}/{aiUsage.limit} today
            </span>
          )}
          {!isPro && (
            <button onClick={() => setShowProModal(true)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #6C3CE9, #9B59B6)", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              Go Pro
            </button>
          )}
          <button onClick={handleNewChat} style={{ padding: "8px 14px", borderRadius: 8, background: "#1a1a1f", border: "1px solid #333", color: "#888", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            <Plus size={14} /> New Chat
          </button>
        </div>
      </div>

      {!isAIConfigured() && (
        <div style={{ background: "rgba(239,68,68,0.12)", borderBottom: "1px solid rgba(239,68,68,0.35)", padding: "10px 20px", color: "#ef4444", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
          AI key missing — add VITE_GROQ_API_KEY in your environment (Vercel dashboard or .env)
        </div>
      )}

      {/* Subject context pills */}
      <div style={{ display: "flex", gap: 6, padding: "8px 20px", background: "#0a0a0f", borderBottom: "1px solid #1e1e2a", overflowX: "auto", flexShrink: 0 }}>
        {["General", ...userSubjects].map(s => (
          <button key={s} onClick={() => setActiveSubject(s)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: activeSubject === s ? "#6C3CE9" : "#1a1a1f", color: activeSubject === s ? "#fff" : "#888", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Chat area — free users get PLANS.free.limits.aiTutorMessages per day */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {messages.length === 0 && !loading && (
              <div style={{ textAlign: "center", paddingTop: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>Hi {user?.displayName?.split(" ")[0] || "Student"}! I'm your ExamPadi AI Tutor</h2>
                <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px", maxWidth: 400, margin: "0 auto 24px" }}>Ask me anything about your subjects. I can explain topics, solve questions, make study plans, and more.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, margin: "0 auto" }}>
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => handleSend(p)} style={{ padding: "10px 16px", borderRadius: 10, background: "#1a1a1f", border: "1px solid #2a2a35", color: "#ccc", cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
                      {p} <ChevronRight size={14} color="#666" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
                {m.role === "ai" && (
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6C3CE9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, marginRight: 8, flexShrink: 0 }}>E</div>
                )}
                <div style={{ maxWidth: "70%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? "#6C3CE9" : "#1a1a1f", border: m.role === "user" ? "none" : "1px solid #2a2a3a" }}>
                  <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{m.content}</div>
                  <div style={{ fontSize: 10, color: m.role === "user" ? "rgba(255,255,255,0.5)" : "#555", marginTop: 4, textAlign: "right" }}>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#6C3CE9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, marginRight: 8, flexShrink: 0 }}>E</div>
                <div style={{ padding: "14px 20px", borderRadius: "18px 18px 18px 4px", background: "#1a1a1f", border: "1px solid #2a2a3a" }}>
                  <div className="typing-dots" style={{ display: "flex", gap: 4 }}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ background: "#0d0d12", borderTop: "1px solid #1e1e2a", padding: 16, flexShrink: 0 }}>
            <div style={{ position: "relative", maxWidth: 800, margin: "0 auto" }}>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Ask anything about ${activeSubject}...`} rows={1} style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 12, background: "#1a1a1f", border: "1px solid #333", color: "#fff", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <button onClick={() => handleSend()} disabled={!input.trim() || loading} style={{ position: "absolute", right: 6, bottom: 6, width: 36, height: 36, borderRadius: "50%", background: input.trim() && !loading ? "#6C3CE9" : "#333", border: "none", color: input.trim() && !loading ? "#fff" : "#666", cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} reason="ai" dismissible />

      <style>{`
        .typing-dots span { width: 8px; height: 8px; background: #888; border-radius: 50%; animation: dotBounce 1.4s infinite ease-in-out both; }
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes dotBounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}