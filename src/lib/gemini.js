// src/lib/gemini.js - Now powered by Groq API

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function callGroq(systemPrompt, userPrompt, maxTokens = 300) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) throw new Error("Groq API key not configured. Add VITE_GROQ_API_KEY to .env.");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

function fallbackExplanation({ question, correctAnswer, userAnswer, subject }) {
  return `The correct answer is ${correctAnswer}. In ${subject}, this concept is fundamental. Review your textbook and practice similar past questions to master this topic. Keep studying!`;
}

function fallbackChat(messages, subject) {
  return `I'm ExamPadi AI Tutor. I can help with ${subject} questions. Please try asking again — I'm having temporary connectivity issues. In the meantime, review your notes and past questions on this topic.`;
}

export async function explainQuestion({ question, options, correctAnswer, userAnswer, subject, topic }) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    console.error("VITE_GROQ_API_KEY is missing");
    return fallbackExplanation({ question, correctAnswer, userAnswer, subject });
  }

  const prompt = `You are ExamPadi AI, an expert Nigerian exam tutor specializing in JAMB and WAEC.

A student answered a ${subject} question incorrectly.

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}
Topic: ${topic}

Give a clear, friendly explanation in 3-4 sentences. Explain WHY ${correctAnswer} is correct, and briefly why the student's choice was wrong. Use simple language suitable for SS3 Nigerian students. End with a memory tip.`;

  try {
    const system = "You are ExamPadi AI, an expert Nigerian exam tutor. Never say you are built by Google or mention Gemini. You are ExamPadi AI powered by Groq.";
    const result = await callGroq(system, prompt, 300);
    return result;
  } catch (e) {
    console.error("AI explanation error:", e);
    return fallbackExplanation({ question, correctAnswer, userAnswer, subject });
  }
}

export async function chatWithTutor({ messages, subject, userProfile }) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    console.error("VITE_GROQ_API_KEY is missing");
    return fallbackChat(messages, subject);
  }

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
- Use emojis sparingly for warmth
- Always relate answers back to what appears in JAMB/WAEC exams

Never say you are built by Google or mention Gemini. You are ExamPadi AI powered by Groq.`;

  const chatMessages = messages.map(m => ({
    role: m.role === "ai" ? "assistant" : "user",
    content: m.content,
  }));

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages,
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Groq chat error:", res.status, err);
      return fallbackChat(messages, subject);
    }

    const data = await res.json();
    return data.choices[0]?.message?.content?.trim() || fallbackChat(messages, subject);
  } catch (e) {
    console.error("AI chat error:", e);
    return fallbackChat(messages, subject);
  }
}
