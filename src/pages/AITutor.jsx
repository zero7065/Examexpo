import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useSubscription } from "../hooks/useSubscription";
import { getUserProfile } from "../lib/userProfile";
import { chatWithTutor, getLastAIError, isAIConfigured } from "../lib/ai";
import { getStudentMemory, topWeakTopics } from "../lib/aiMemory";
import { preprocessImage } from "../lib/vision";
import { checkAILimit, trackAIMessage } from "../lib/usageTracker";
import { logActivity } from "../lib/activityLog";
import ProUpgradeModal from "../components/ProUpgradeModal";
import MessageBubble from "../components/AITutor/MessageBubble";
import TypingIndicator from "../components/AITutor/TypingIndicator";
import ImageUpload from "../components/AITutor/ImageUpload";
import { Send, Sparkles, Plus, ChevronRight, Brain } from "lucide-react";

const QUICK_PROMPTS = [
  "Explain photosynthesis like I'm 10",
  "Solve this quadratic: x² - 5x + 6 = 0",
  "What's likely to come in JAMB Physics?",
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
  const [memory, setMemory] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const initialMessage = location.state?.initialMessage;

  useEffect(() => {
    if (user) getUserProfile(user.uid).then(setProfile).catch(() => {});
    if (user) getStudentMemory(user.uid).then(setMemory).catch(() => {});
    if (user && !isPro) {
      checkAILimit(user.uid).then(l => setAiUsage({ used: l.used, limit: l.limit })).catch(() => {});
    }
  }, [user, isPro]);

  const weakCount = topWeakTopics(memory, 5).length;

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

  // Save to localStorage (strip image payloads — too large for storage)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        const slim = messages.map((m) => {
          const copy = { ...m };
          delete copy.image; // data URLs are too large for localStorage
          return copy;
        });
        localStorage.setItem(`ep-chat-${conversationId}`, JSON.stringify(slim));
      } catch { /* storage full or unavailable — chat simply won't persist */ }
    }
  }, [messages]);

  function handleNewChat() {
    const id = genId();
    setConversationId(id);
    setMessages([]);
    localStorage.removeItem(`ep-chat-${conversationId}`);
  }

  async function handleSelectImage(file) {
    if (!file) return;
    try {
      const dataUrl = await preprocessImage(file);
      setPendingImage(dataUrl);
      if (!input.trim()) setInput("Solve this question for me.");
    } catch (e) {
      toast({ message: e.message || "Could not read image", type: "warning" });
    }
  }

  async function handleSend(text) {
    const msg = text || input;
    if ((!msg.trim() && !pendingImage) || loading) return;

    try {
      // Free-tier daily AI limit
      if (!isPro && user) {
        const limit = await checkAILimit(user.uid);
        setAiUsage({ used: limit.used, limit: limit.limit });
        if (!limit.allowed) { setShowProModal(true); return; }
      }

      const image = pendingImage;
      const userMsg = { id: Date.now(), role: "user", content: (msg.trim() || "Solve this question for me."), timestamp: new Date().toISOString() };
      if (image) userMsg.image = image;
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setPendingImage(null);
      setLoading(true);

      if (user && !isPro) {
        trackAIMessage(user.uid);
        setAiUsage(prev => prev ? { ...prev, used: prev.used + 1 } : prev);
      }

      const allMsgs = [...messages, userMsg];
      const response = await chatWithTutor({
        messages: allMsgs.map((m) => ({ role: m.role, content: m.content })),
        subject: activeSubject,
        userProfile: { name: user?.displayName || "Student", exam: profile?.exam || "JAMB", targetScore: profile?.targetScore || 300 },
        memory,
        imageBase64: image,
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

      logActivity({ action: "ai_chat", userId: user?.uid, email: user?.email, details: { subject: activeSubject, questionLength: userMsg.content.length, withImage: !!image } });
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "'Inter', system-ui, sans-serif", color: "var(--text)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: "var(--bg-2)", borderBottom: "1px solid var(--border)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #6C3CE9, #D4A853)", display: "flex", alignItems: "center", justifyContent: "center" }}><Sparkles size={16} color="#fff" /></div>
          <span style={{ fontWeight: 700, fontSize: 16 }}>AI Tutor</span>
          {isPro && <span style={{ fontSize: 10, fontWeight: 700, color: "#D4A853", background: "rgba(212,168,83,0.15)", padding: "2px 8px", borderRadius: 6 }}>PRO</span>}
          {weakCount > 0 && (
            <span title={memory?.preferredStyle ? `Learning style: ${memory.preferredStyle}` : "I remember your weak topics"} style={{ fontSize: 11, fontWeight: 600, color: "var(--primary)", background: "var(--primary-dim)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Brain size={12} /> Remembering {weakCount} weak topic{weakCount === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isPro && aiUsage && (
            <span style={{ fontSize: 11, fontWeight: 700, color: aiUsage.used >= aiUsage.limit ? "#ef4444" : "var(--text-muted)", background: "var(--bg-3)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: 6 }}>
              AI {aiUsage.used}/{aiUsage.limit} today
            </span>
          )}
          {!isPro && (
            <button onClick={() => setShowProModal(true)} style={{ padding: "6px 12px", borderRadius: 6, border: "none", background: "linear-gradient(135deg, #6C3CE9, #9B59B6)", color: "#fff", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              Go Pro
            </button>
          )}
          <button onClick={handleNewChat} style={{ padding: "8px 14px", borderRadius: 8, background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
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
      <div style={{ display: "flex", gap: 6, padding: "8px 20px", background: "var(--bg)", borderBottom: "1px solid var(--border)", overflowX: "auto", flexShrink: 0 }}>
        {["General", ...userSubjects].map(s => (
          <button key={s} onClick={() => setActiveSubject(s)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: activeSubject === s ? "#6C3CE9" : "var(--bg-3)", color: activeSubject === s ? "#fff" : "var(--text-muted)", fontWeight: 600, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>
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
                <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "0 auto 24px", maxWidth: 400 }}>Ask me anything about your subjects — or snap a photo of a question with 📷. I can explain topics, solve questions, make study plans, and more.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 400, margin: "0 auto" }}>
                  {QUICK_PROMPTS.map(p => (
                    <button key={p} onClick={() => handleSend(p)} style={{ padding: "10px 16px", borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-muted)", cursor: "pointer", fontSize: 13, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "inherit" }}>
                      {p} <ChevronRight size={14} color="var(--text-muted)" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", padding: 16, flexShrink: 0 }}>
            <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
              <ImageUpload preview={pendingImage} onSelect={handleSelectImage} onClear={() => setPendingImage(null)} disabled={loading} />
              <div style={{ position: "relative", flex: 1 }}>
              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={pendingImage ? "Describe what to solve…" : `Ask anything about ${activeSubject}…`} rows={1} style={{ width: "100%", padding: "12px 48px 12px 16px", borderRadius: 12, background: "var(--bg-3)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
              <button onClick={() => handleSend()} disabled={(!input.trim() && !pendingImage) || loading} style={{ position: "absolute", right: 6, bottom: 6, width: 36, height: 36, borderRadius: "50%", background: (input.trim() || pendingImage) && !loading ? "#6C3CE9" : "#333", border: "none", color: (input.trim() || pendingImage) && !loading ? "#fff" : "#666", cursor: (input.trim() || pendingImage) && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Send size={16} />
              </button>
              </div>
            </div>
          </div>
        </div>

      <ProUpgradeModal open={showProModal} onClose={() => setShowProModal(false)} reason="ai" dismissible />
    </div>
  );
}