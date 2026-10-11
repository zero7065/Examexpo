// src/lib/ai.js - Unified Groq AI client

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Verified against GET /openai/v1/models for this API key (Oct 2026).
// Old models (llama-3.x, qwen3-32b, llama-4-scout) no longer exist for this key.
const MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "allam-2-7b",
];

let _lastAIError = null;

export function getLastAIError() {
  return _lastAIError;
}

// Returns the last AI error only if it happened recently (i.e. during the current call)
export function getAIErrorIfRecent(ms = 15000) {
  if (_lastAIError && Date.now() - _lastAIError.time < ms) return _lastAIError;
  return null;
}

export function clearAIError() {
  _lastAIError = null;
}

export function isAIConfigured() {
  return Boolean(import.meta.env.VITE_GROQ_API_KEY);
}

function stripJsonFences(text) {
  if (!text) return text;
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  }
  return cleaned.trim();
}

async function callGroqWithFallback(systemPrompt, userPrompt, maxTokens = 300, temperature = 0.5) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    _lastAIError = { message: "Groq API key not configured. Add VITE_GROQ_API_KEY to environment variables.", time: Date.now() };
    throw new Error("Groq API key not configured.");
  }

  let lastError;
  for (const model of MODELS) {
    try {
      // gpt-oss models are reasoning models — reasoning tokens count toward max_tokens
      const tokens = model.startsWith("openai/gpt-oss") ? maxTokens + 2000 : maxTokens;
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: tokens,
          temperature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        _lastAIError = null;
        return data.choices[0]?.message?.content?.trim() || "";
      }

      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `Groq error: ${res.status}`;
      console.warn(`[AI] Model ${model} failed: ${msg}`);
      lastError = new Error(msg);
    } catch (e) {
      console.warn(`[AI] Model ${model} network error:`, e.message);
      lastError = e;
    }
  }
  _lastAIError = { message: lastError?.message || "All AI models failed", time: Date.now() };
  throw lastError || new Error("All AI models failed");
}

async function callGroqChatWithFallback(systemPrompt, messages, maxTokens = 600, temperature = 0.8) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    _lastAIError = { message: "Groq API key not configured. Add VITE_GROQ_API_KEY to environment variables.", time: Date.now() };
    throw new Error("Groq API key not configured.");
  }

  let lastError;
  for (const model of MODELS) {
    try {
      const tokens = model.startsWith("openai/gpt-oss") ? maxTokens + 2000 : maxTokens;
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          max_tokens: tokens,
          temperature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        _lastAIError = null;
        return data.choices[0]?.message?.content?.trim() || "";
      }

      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `Groq error: ${res.status}`;
      console.warn(`[AI] Model ${model} failed: ${msg}`);
      lastError = new Error(msg);
    } catch (e) {
      console.warn(`[AI] Model ${model} network error:`, e.message);
      lastError = e;
    }
  }
  _lastAIError = { message: lastError?.message || "All AI models failed", time: Date.now() };
  throw lastError || new Error("All AI models failed");
}

import { VISION_MODEL, downscaleDataUrl } from "./vision";
import { topWeakTopics, recentSummaries } from "./aiMemory";

// ─── Vision chat (image-capable). ONLY tries the multimodal model —
// gpt-oss/allam are text-only and cannot accept image payloads.
async function callGroqVisionChat(systemPrompt, textMessages, imageBase64, maxTokens = 800) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    _lastAIError = { message: "Groq API key not configured. Add VITE_GROQ_API_KEY to environment variables.", time: Date.now() };
    throw new Error("Groq API key not configured.");
  }
  // Attach the image to the last user message (OpenAI content-array format)
  const msgs = textMessages.map((m) => ({ role: m.role, content: m.content }));
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i].role === "user") {
      msgs[i] = {
        role: "user",
        content: [
          { type: "text", text: String(msgs[i].content || "") },
          { type: "image_url", image_url: { url: imageBase64 } },
        ],
      };
      break;
    }
  }
  const body = {
    model: VISION_MODEL,
    messages: [{ role: "system", content: systemPrompt }, ...msgs],
    max_tokens: maxTokens,
    temperature: 0.6,
  };
  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      _lastAIError = null;
      return data.choices[0]?.message?.content?.trim() || "";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq error: ${res.status}`);
  } catch (e) {
    _lastAIError = { message: e.message, time: Date.now() };
    throw e;
  }
}

// Vision entry point with one downscaled retry before surfacing the real error.
export async function askGroqVision({ systemPrompt, messages, imageBase64, maxTokens = 800 }) {
  try {
    return await callGroqVisionChat(systemPrompt, messages, imageBase64, maxTokens);
  } catch (firstErr) {
    console.warn("[AI] Vision full-size failed, retrying downscaled:", firstErr.message);
    try {
      const smaller = await downscaleDataUrl(imageBase64, 512);
      return await callGroqVisionChat(systemPrompt, messages, smaller, maxTokens);
    } catch (e) {
      console.warn("[AI] Vision downscaled retry failed:", e.message);
      throw firstErr; // surface the original, more informative error
    }
  }
}

// ─── Memory-aware tutor system prompt ───
const STYLE_INSTRUCTIONS = {
  visual: "Prefer visual explanations: describe diagrams, layouts and what the student should picture or sketch.",
  verbal: "Prefer clear verbal explanations: precise definitions and well-structured prose.",
  example: "Lead with concrete worked examples before stating rules; every concept gets an example first.",
  "step-by-step": "Break everything into small numbered steps; never skip intermediate reasoning.",
};

export function buildTutorSystemPrompt({ subject, userProfile, memory }) {
  const weak = topWeakTopics(memory, 5);
  const style = memory?.preferredStyle;
  const sums = recentSummaries(memory, 3);

  const lines = [
    "You are ExamPadi AI Tutor — an expert, friendly Nigerian exam tutor specializing in JAMB, WAEC, NECO and NABTEB.",
    "",
    "Student profile:",
    `- Name: ${userProfile?.name || "Student"}`,
    `- Exam: ${userProfile?.exam || "JAMB"}`,
    `- Target score: ${userProfile?.targetScore || "300"}`,
    `- Current subject context: ${subject}`,
    "",
    "Your role:",
    "- Explain concepts clearly using simple Nigerian student-friendly language",
    "- Reference Nigerian curriculum (NERDC, WAEC syllabus)",
    "- Give worked examples with step-by-step solutions",
    "- Be encouraging but honest about weak areas",
    "- Keep responses concise but complete — under 300 words unless solving a long problem",
    "- Always relate answers back to what appears in JAMB/WAEC exams",
    "- Explain WHY an answer is right, not just what it is",
    '- End study-type answers with "What to revise next:" and one concrete topic',
  ];

  if (weak.length > 0) {
    lines.push(
      "",
      "Known weak topics for this student (connect new explanations to these when relevant):",
      ...weak.map((w) => `- ${w.subject}: ${w.topic} (${w.errorCount || 0} recent errors)`)
    );
  }
  if (style && STYLE_INSTRUCTIONS[style]) {
    lines.push("", `Preferred learning style (${style}): ${STYLE_INSTRUCTIONS[style]}`);
  }
  if (sums.length > 0) {
    lines.push("", "Recent session notes:");
    sums.forEach((s, i) => {
      const bullets = Array.isArray(s.bullets) ? s.bullets.join("; ") : String(s.bullets || "");
      lines.push(`- Session ${i + 1}: ${bullets}`);
    });
  }

  lines.push("", "Never say you are built by Google or mention Gemini. You are ExamPadi AI powered by Groq.");
  return lines.join("\n");
}

// Generic single-prompt caller — used by question generators
export async function askGroq(systemPrompt, userPrompt, opts = {}) {
  return callGroqWithFallback(systemPrompt, userPrompt, opts.maxTokens ?? 300, opts.temperature ?? 0.5);
}

export async function explainAnswer({ question, options, userAnswer, correctAnswer, subject, exam }) {
  const system = `You are a friendly Nigerian exam tutor for ${exam || "JAMB"}. Never say you are built by Google or mention Gemini. You are ExamPadi AI powered by Groq.`;
  const user = `Question: ${question}\nOptions: A) ${options.A} B) ${options.B} C) ${options.C} D) ${options.D}\nStudent answered: ${userAnswer}\nCorrect answer: ${correctAnswer}\nSubject: ${subject}\nExplain why ${correctAnswer} is correct in 3-4 sentences. End with a memory tip.`;
  try {
    return await callGroqWithFallback(system, user, 300);
  } catch (err) {
    console.warn("explainAnswer fallback:", err.message);
    return `The correct answer is ${correctAnswer}. In ${subject}, this concept is fundamental. Review your textbook and practice similar past questions to master this topic. Keep studying!`;
  }
}

export async function explainQuestion({ question, options, correctAnswer, userAnswer, subject, topic }) {
  const system = "You are ExamPadi AI, an expert Nigerian exam tutor. Never say you are built by Google or mention Gemini. You are ExamPadi AI powered by Groq.";
  const prompt = `A student answered a ${subject} question incorrectly.

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}
Topic: ${topic}

Give a clear, friendly explanation in 3-4 sentences. Explain WHY ${correctAnswer} is correct, and briefly why the student's choice was wrong. Use simple language suitable for SS3 Nigerian students. End with a memory tip.`;
  try {
    return await callGroqWithFallback(system, prompt, 300);
  } catch (e) {
    console.warn("explainQuestion fallback:", e.message);
    return `The correct answer is ${correctAnswer}. In ${subject}, this concept is fundamental. Review your textbook and practice similar past questions to master this topic. Keep studying!`;
  }
}

export async function chatWithTutor({ messages, subject, userProfile, memory = null, imageBase64 = null }) {
  const systemPrompt = buildTutorSystemPrompt({ subject, userProfile, memory });

  const chatMessages = messages.map(m => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.content,
  }));

  try {
    // Image present → vision path (multimodal model only, no text-model fallback)
    if (imageBase64) {
      return await askGroqVision({ systemPrompt, messages: chatMessages, imageBase64, maxTokens: 800 });
    }
    return await callGroqChatWithFallback(systemPrompt, chatMessages, 600, 0.8);
  } catch (e) {
    console.warn("chatWithTutor fallback:", e.message);
    return `I'm ExamPadi AI Tutor. I can help with ${subject} questions. Please try asking again — I'm having temporary connectivity issues. In the meantime, review your notes and past questions on this topic.`;
  }
}

export async function getStudyTip(subject, weakTopics) {
  const system = "You are a JAMB/WAEC Nigerian exam coach.";
  const user = `Student is weak in ${subject}. Topics: ${weakTopics.join(", ")}. Give 3 tips.`;
  try {
    return await callGroqWithFallback(system, user, 150);
  } catch (err) {
    console.warn("getStudyTip fallback:", err.message);
    return `Focus on past questions for ${weakTopics[0]}. Practice consistently every day. Review your notes and join study groups.`;
  }
}

export async function getDailyQuote() {
  const system = "You write motivational quotes for Nigerian students.";
  const user = "Give one motivational quote.";
  try {
    return await callGroqWithFallback(system, user, 50);
  } catch (err) {
    console.warn("getDailyQuote fallback:", err.message);
    return "Every question you practice today is a problem you won't face on exam day. Keep pushing!";
  }
}

export async function predictLikelyQuestions({ subject, exam, count = 6 }) {
  const system = `You are a ${exam} expert. Predict likely topics for ${subject}. Return ONLY valid JSON array, no markdown fences.`;
  const user = `Predict ${count} topics. Return JSON array like: [{"topic":"...","likelihood":"...","reason":"...","sampleQuestion":"..."}]`;
  try {
    const res = await callGroqWithFallback(system, user, 800);
    return JSON.parse(stripJsonFences(res));
  } catch (err) {
    console.warn("predictLikelyQuestions fallback:", err.message);
    _lastAIError = { message: err.message, time: Date.now() };
    return [
      { topic: "Core Fundamentals", likelihood: "very high", reason: "Always tested.", sampleQuestion: "What is the foundational principle?" }
    ];
  }
}

export async function generateStudyPlan({ targetScore, examDate, currentLevel, weakTopics }) {
  const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  try {
    const system = "You are an exam consultant. Create a study plan as JSON. Return ONLY valid JSON, no markdown fences.";
    const user = `Create a ${Math.max(7, daysUntilExam)}-day study plan for a student targeting ${targetScore}/400. Weak topics: ${weakTopics.join(", ")}.
Return JSON exactly in this shape:
{"totalDays": <number>, "topics": [{"topic": "<name>", "description": "<1-2 sentence plan>", "duration": "<e.g. 2 hours>", "exercises": ["<actionable task>", "..."]}]}
Include 5-8 topics ordered from foundations to final revision.`;
    const res = await callGroqWithFallback(system, user, 1500);
    return JSON.parse(stripJsonFences(res));
  } catch (err) {
    console.warn("generateStudyPlan fallback:", err.message);
    _lastAIError = { message: err.message, time: Date.now() };
    return {
      totalDays: Math.max(7, daysUntilExam),
      topics: [
        { topic: "Foundation Review", description: "Revise basic concepts", duration: "2 hours", exercises: ["20 basic questions", "Review formulas"] },
        { topic: "Past Questions", description: "Solve 2018-2023 questions", duration: "3 hours", exercises: ["40 mixed questions", "Review explanations"] },
        { topic: "Weak Topics Focus", description: "Practice weak areas", duration: "2.5 hours", exercises: ["30 topic questions", "Note patterns"] },
        { topic: "Mock Simulation", description: "CBT under timed conditions", duration: "2 hours", exercises: ["50 questions in 1hr 40mins", "Review score"] },
        { topic: "Final Review", description: "Review mistakes and summaries", duration: "2 hours", exercises: ["Review mistake log", "Read notes"] }
      ]
    };
  }
}

export async function generateFlashcards({ subject, topic, count = 10, exam = "JAMB" }) {  try {
    const system = "You are a Nigerian exam tutor creating revision flashcards. Return ONLY valid JSON, no markdown fences.";
    const user = `Create ${count} exam-focused flashcards for ${exam} ${subject}${topic ? `, topic: ${topic}` : ""}.
Return JSON exactly in this shape:
{"cards": [{"front": "<question or term, max 20 words>", "back": "<concise answer or definition, max 40 words>", "tag": "<topic>"}]}
Cover the highest-yield facts, formulas, definitions and distinctions. No fluff.`;
    const res = await callGroqWithFallback(system, user, 2000, 0.6);
    const parsed = JSON.parse(stripJsonFences(res));
    const cards = Array.isArray(parsed) ? parsed : parsed.cards;
    if (!Array.isArray(cards) || cards.length === 0) throw new Error("No flashcards returned");
    return cards
      .filter((c) => c && c.front && c.back)
      .map((c, i) => ({ id: i + 1, front: String(c.front), back: String(c.back), tag: c.tag || topic || subject }));
  } catch (err) {
    console.warn("generateFlashcards fallback:", err.message);
    _lastAIError = { message: err.message, time: Date.now() };
    return [];
  }
}

// ─── Session summarization ───
// Pro: Groq produces 3 learning bullets + 1 weak topic (1 LLM call).
// Free: instant offline heuristic from scores/weak topics (zero tokens).
export async function summarizeSessionGroq({ subject, correct, total, weakTopics = [] }) {
  const system = "You are a concise study coach. Return ONLY valid JSON, no markdown fences.";
  const user = `A student just finished a ${subject} practice session: ${correct}/${total} correct. Weak topics: ${weakTopics.join(", ") || "none identified"}. Return JSON exactly: {"bullets": ["<bullet 1>", "<bullet 2>", "<bullet 3>"], "weakTopic": "<single weakest topic or null>"}. Each bullet max 15 words, actionable and encouraging.`;
  const res = await callGroqWithFallback(system, user, 300, 0.5);
  const parsed = JSON.parse(stripJsonFences(res));
  if (!Array.isArray(parsed.bullets) || parsed.bullets.length === 0) throw new Error("Empty summary");
  return {
    at: Date.now(),
    subject,
    bullets: parsed.bullets.slice(0, 3).map(String),
    weakTopic: parsed.weakTopic || null,
  };
}

export function heuristicSummary({ subject, correct, total, weakTopics = [] }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const weak = weakTopics[0];
  const bullets = [
    `Scored ${pct}% (${correct}/${total}) in ${subject} — ${pct >= 70 ? "strong session, keep the streak" : pct >= 50 ? "solid base, push weak spots" : "focus session needed on fundamentals"}.`,
    weak ? `Priority revision: ${weak}.` : "No dominant weak topic — broaden coverage next.",
    pct >= 70 ? "Next: timed mixed practice to build exam speed." : "Next: re-attempt missed questions with AI explanations.",
  ];
  return { at: Date.now(), subject, bullets, weakTopic: weak || null };
}

// ─── Guide assistant (helps new users in plain language) ───
// App route map the guide can reference. Keep in sync with App.jsx routes.
export const GUIDE_ROUTES = [
  { path: "/dashboard", label: "Dashboard", keywords: ["home", "dashboard", "start", "overview"] },
  { path: "/select", label: "Practice", keywords: ["practice", "question", "start practicing", "answer", "quiz"] },
  { path: "/mock-exam", label: "Mock Exam", keywords: ["mock", "cbt", "simulate", "exam simulation", "timed", "full exam"] },
  { path: "/ai-tutor", label: "AI Tutor", keywords: ["ai", "tutor", "explain", "understand", "solve", "help me learn", "photo", "stuck"] },
  { path: "/study-plan", label: "Study Plan", keywords: ["plan", "schedule", "timetable", "organize", "routine", "study plan"] },
  { path: "/flashcards", label: "Flashcards", keywords: ["flashcard", "memorize", "remember", "revise", "recall"] },
  { path: "/question-bank", label: "Question Bank", keywords: ["bank", "past question", "browse", "topic"] },
  { path: "/past-questions", label: "Past Questions", keywords: ["past question", "previous year", "likely question", "prediction"] },
  { path: "/stats", label: "Stats", keywords: ["stat", "analytics", "progress", "performance", "score", "weak", "mastery"] },
  { path: "/mastery", label: "Mastery", keywords: ["mastery", "weak topic", "strong"] },
  { path: "/progress", label: "Progress", keywords: ["achievement", "badge", "level"] },
  { path: "/history", label: "History", keywords: ["history", "past session", "review", "mistake"] },
  { path: "/leaderboard", label: "Leaderboard", keywords: ["leaderboard", "rank", "top", "compete", "xp", "point", "streak"] },
  { path: "/study-partners", label: "Study Partners", keywords: ["partner", "friend", "together", "share test", "invite"] },
  { path: "/assignment", label: "Assignments", keywords: ["assignment", "homework", "task"] },
  { path: "/notepad", label: "Notepad", keywords: ["note", "write", "formula"] },
  { path: "/settings", label: "Settings", keywords: ["setting", "subject", "change subject", "theme", "dark", "light", "notification", "reminder", "language"] },
  { path: "/profile", label: "Profile", keywords: ["profile", "avatar", "photo", "name", "account", "delete"] },
  { path: "/payment", label: "Go Pro", keywords: ["pro", "pay", "upgrade", "cost", "price", "subscription", "unlock", "limit"] },
  { path: "/help", label: "Help", keywords: ["help", "guide", "how to", "support"] },
  { path: "/contact", label: "Contact", keywords: ["contact", "human", "whatsapp", "email", "complain"] },
];

// Local intent matcher: free, instant, offline. Returns matched routes.
export function matchGuideRoutes(text) {
  const lower = String(text || "").toLowerCase();
  const scored = GUIDE_ROUTES.map((r) => {
    let score = 0;
    for (const k of r.keywords) {
      if (lower.includes(k)) score += k.length; // longer keyword = more specific
    }
    return { ...r, score };
  }).filter((r) => r.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

// AI-powered guide answer: organized steps referencing real app pages.
export async function askGuide(issueText, userProfile) {
  const system = `You are the ExamPadi AI Guide. A new student describes an issue or goal in plain words. Respond with a short, organized plan: 1-3 numbered steps, each naming the EXACT app page to open from this list: Dashboard, Practice, Mock Exam, AI Tutor, Study Plan, Flashcards, Question Bank, Past Questions, Stats, Mastery, Progress, History, Leaderboard, Study Partners, Assignments, Notepad, Settings, Profile, Go Pro, Help, Contact. Rules: max 120 words; plain simple language; if they need a human, point to Contact (WhatsApp). Never invent pages. Never say you are built by Google. You are ExamPadi AI powered by Groq.`;
  const user = `Student says: "${issueText}". Student exam: ${userProfile?.exam || "JAMB"}. Give the organized steps.`;
  return callGroqWithFallback(system, user, 300, 0.5);
}
