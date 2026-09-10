// src/lib/ai.js - Unified Groq AI client

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = ["qwen/qwen3-32b", "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

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
  if (!key) throw new Error("Groq API key not configured.");

  let lastError;
  for (const model of MODELS) {
    try {
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
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0]?.message?.content?.trim() || "";
      }

      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `Groq error: ${res.status}`;
      console.warn(`Model ${model} failed: ${msg}`);
      lastError = new Error(msg);
    } catch (e) {
      console.warn(`Model ${model} network error:`, e.message);
      lastError = e;
    }
  }
  throw lastError || new Error("All AI models failed");
}

async function callGroqChatWithFallback(systemPrompt, messages, maxTokens = 600, temperature = 0.8) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("Groq API key not configured.");

  let lastError;
  for (const model of MODELS) {
    try {
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
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return data.choices[0]?.message?.content?.trim() || "";
      }

      const err = await res.json().catch(() => ({}));
      const msg = err.error?.message || `Groq error: ${res.status}`;
      console.warn(`Model ${model} failed: ${msg}`);
      lastError = new Error(msg);
    } catch (e) {
      console.warn(`Model ${model} network error:`, e.message);
      lastError = e;
    }
  }
  throw lastError || new Error("All AI models failed");
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

export async function chatWithTutor({ messages, subject, userProfile }) {
  const systemPrompt = `You are ExamPadi AI Tutor — an expert, friendly Nigerian exam tutor specializing in JAMB, WAEC, and NABTEB.

Student profile:
- Name: ${userProfile?.name || "Student"}
- Exam: ${userProfile?.exam || "JAMB"}
- Target score: ${userProfile?.targetScore || "300"}
- Current subject context: ${subject}

Your role:
- Explain concepts clearly using simple Nigerian student-friendly language
- Reference Nigerian curriculum (NERDC, WAEC syllabus)
- Give worked examples with step-by-step solutions
- Be encouraging but honest about weak areas
- Keep responses concise but complete — under 300 words unless solving a long problem
- Always relate answers back to what appears in JAMB/WAEC exams

Never say you are built by Google or mention Gemini. You are ExamPadi AI powered by Groq.`;

  const chatMessages = messages.map(m => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.content,
  }));

  try {
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
    return [
      { topic: "Core Fundamentals", likelihood: "very high", reason: "Always tested.", sampleQuestion: "What is the foundational principle?" }
    ];
  }
}

export async function generateStudyPlan({ targetScore, examDate, currentLevel, weakTopics }) {
  const daysUntilExam = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));
  try {
    const system = "You are an exam consultant. Create a study plan as JSON. Return ONLY valid JSON, no markdown fences.";
    const user = `Create a ${Math.max(7, daysUntilExam)}-day plan for ${targetScore}. Weak: ${weakTopics.join(", ")}. Return JSON with totalDays and topics array.`;
    const res = await callGroqWithFallback(system, user, 1500);
    return JSON.parse(stripJsonFences(res));
  } catch (err) {
    console.warn("generateStudyPlan fallback:", err.message);
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
