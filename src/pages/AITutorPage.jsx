// src/pages/AITutorPage.jsx - Enhanced AI Tutor
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { callGroq } from "../groq";
import { Send, Bot, User, Loader2, BookOpen, Sparkles, Zap, Target, Lightbulb, ArrowRight } from "lucide-react";

const AITutorPage = () => {
  const { user, isPro } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const messagesEndRef = useRef(null);

  const proStatus = isPro();
  const FREE_LIMIT = 30;
  
  useEffect(() => {
    const saved = localStorage.getItem(`ep-ai-tutor-questions-${user?.email}`);
    if (saved) setQuestionsUsed(parseInt(saved));
  }, [user]);

  useEffect(() => {
    if (user?.email && questionsUsed > 0) {
      localStorage.setItem(`ep-ai-tutor-questions-${user.email}`, questionsUsed.toString());
    }
  }, [questionsUsed, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canAsk = proStatus || questionsUsed < FREE_LIMIT;
  const remaining = proStatus ? "Unlimited" : (FREE_LIMIT - questionsUsed);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    if (!canAsk) {
      toast({ message: "Daily AI question limit reached. Upgrade to Pro!", type: "warning" });
      navigate("/payment");
      return;
    }

    const userQuestion = input.trim();
    setInput("");
    setLoading(true);

    setMessages(prev => [...prev, { role: "user", content: userQuestion }]);

    if (!proStatus) setQuestionsUsed(prev => prev + 1);

    try {
      const response = await callGroq(
        `You are ExamPadi AI, a friendly and expert Nigerian tutor for JAMB/WAEC students. 

Your teaching style:
- Use simple language with real-life examples from Nigeria
- Include memorable tips starting with "💡 Remember:"
- Break down complex topics into bite-sized pieces
- Use emojis to make learning fun
- Include step-by-step explanations with examples
- Be encouraging and supportive

Format your response with:
- Clear explanations
- Practical examples students can relate to
- Memory tips
- Brief summaries at the end`,

        `Student Question: ${userQuestion}

Please provide a detailed, easy-to-understand explanation with examples.`,
        600
      );
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Oops! Something went wrong. Please try again! 😅" }]);
    } finally {
      setLoading(false);
    }
  };

  const quickTopics = [
    { icon: <Zap size={16} />, label: "Physics", question: "Explain Newton's three laws of motion with examples" },
    { icon: <Sparkles size={16} />, label: "Chemistry", question: "What is chemical bonding and its types?" },
    { icon: <Target size={16} />, label: "Math", question: "How do I solve quadratic equations?" },
    { icon: <BookOpen size={16} />, label: "Biology", question: "Explain the process of photosynthesis" },
    { icon: <Lightbulb size={16} />, label: "Economics", question: "What is supply and demand?" },
    { icon: <Sparkles size={16} />, label: "English", question: "What are literary devices and examples?" },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center">
            <Bot size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text">AI Tutor 🤖</h1>
            <p className="text-sm text-text-muted">Your personal exam helper</p>
          </div>
        </div>
      </header>

      {/* Status Card */}
      <div className={`glass-card p-4 mb-6 flex justify-between items-center ${proStatus ? 'border-accent/30' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${proStatus ? 'bg-accent' : 'bg-yellow-400'}`}></div>
          <span className="text-sm font-bold">
            {proStatus 
              ? <span className="text-accent">⭐ Pro Member - Unlimited Access</span> 
              : <span className="text-text-muted">Free Plan</span>
            }
          </span>
        </div>
        {!proStatus && (
          <button 
            onClick={() => navigate("/payment")}
            className="text-xs bg-gradient-to-r from-accent to-orange-500 text-white px-4 py-2 rounded-full font-bold hover:scale-105 transition-transform"
          >
            ⚡ Upgrade
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="glass-card p-4 mb-4 min-h-[450px] max-h-[500px] overflow-y-auto bg-gradient-to-b from-bg-2/50 to-bg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full py-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6">
              <BookOpen size={48} className="text-primary" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-text">What would you like to learn? 📚</h3>
            <p className="text-text-muted mb-8 max-w-md">Ask me anything about your subjects! I'm here to help you ace your exams.</p>
            
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              {quickTopics.map((topic, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(topic.question)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-primary/20 border border-border hover:border-primary/50 text-text-muted hover:text-text text-sm px-4 py-2 rounded-xl transition-all"
                >
                  {topic.icon}
                  <span>{topic.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-primary/10 rounded-2xl p-4 max-w-md border border-primary/20">
              <p className="text-sm text-text-muted">
                <span className="text-primary font-bold">💡 Pro Tip:</span> Try asking specific questions like "Explain photosynthesis step by step" for detailed answers!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.role === "user" 
                    ? 'bg-gradient-to-br from-primary to-purple-500 text-white' 
                    : 'bg-gradient-to-br from-accent to-yellow-500 text-white'
                }`}>
                  {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div className={`p-4 rounded-2xl max-w-[85%] ${
                  msg.role === "user" 
                    ? 'bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/20' 
                    : 'bg-gradient-to-r from-accent/10 to-yellow-500/10 border border-accent/20'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-accent to-yellow-500 flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-accent/10 flex items-center">
                  <Loader2 className="animate-spin text-accent" size={20} />
                  <span className="ml-2 text-sm text-text-muted">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass-card p-4">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === "Enter" && handleSend()} 
            placeholder={canAsk ? "Type your question here... 📝" : "Upgrade to Pro for unlimited questions"} 
            disabled={!canAsk} 
            className="input-field flex-1 bg-bg-2 border-border hover:border-primary/50 focus:border-primary"
          />
          <button 
            onClick={handleSend} 
            disabled={!canAsk || !input.trim() || loading} 
            className="btn-primary px-6 h-12 rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="flex justify-between mt-3">
          <p className="text-xs text-text-muted">
            {proStatus 
              ? "⭐ Unlimited questions included in Pro" 
              : `📊 ${remaining} questions remaining today`
            }
          </p>
          <p className="text-xs text-text-muted">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;