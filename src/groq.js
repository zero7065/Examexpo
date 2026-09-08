// src/groq.js - Works offline with fallbacks

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function stripJsonFences(text) {
  if (!text) return text;
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  }
  return cleaned.trim();
}

async function callGroqInternal(systemPrompt, userPrompt, maxTokens = 300) {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key) {
    throw new Error("API key not configured");
  }

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
    console.error("Groq API error:", res.status, err);
    throw new Error(err.error?.message || `Groq error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content?.trim() || "";
}

export async function callGroq(systemPrompt, userPrompt, maxTokens = 300) {
  try {
    return await callGroqInternal(systemPrompt, userPrompt, maxTokens);
  } catch (err) {
    console.warn("Groq API unavailable, using fallback:", err.message);
    
    const lowerPrompt = userPrompt.toLowerCase();
    
    if (lowerPrompt.includes("photosynthesis")) {
      return "Photosynthesis is the process by which plants convert sunlight into energy. Key formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂. Remember: Plants make their own food!";
    } else if (lowerPrompt.includes("quadratic")) {
      return "Quadratic Formula: x = (-b ± √(b²-4ac)) / 2a. For equation ax² + bx + c = 0. Used to find roots of quadratic equations.";
    } else if (lowerPrompt.includes("newton")) {
      return "Newton's 3 Laws: 1) Objects stay at rest/motion unless acted upon. 2) F = ma (Force = mass × acceleration). 3) Action = Reaction (for every force, there's an equal opposite force).";
    } else if (lowerPrompt.includes("chemical bonding")) {
      return "Chemical Bonding: Ionic (electron transfer, metal+non-metal), Covalent (electron sharing, non-metals), Metallic (sea of electrons). Determines compound properties!";
    } else if (lowerPrompt.includes("supply and demand")) {
      return "Supply & Demand: When demand ↑, price ↑. When supply ↑, price ↓. Equilibrium is where supply equals demand. Market forces determine prices!";
    }
    
    return "I'd recommend reviewing your textbooks or past questions for this topic. Practice makes perfect!";
  }
}

export async function explainAnswer({ question, options, userAnswer, correctAnswer, subject, exam }) {
  const system = `You are a friendly Nigerian exam tutor for ${exam}.`;
  const user = `Question: ${question}\nOptions: A) ${options.A} B) ${options.B} C) ${options.C} D) ${options.D}\nStudent answered: ${userAnswer}\nCorrect answer: ${correctAnswer}\nSubject: ${subject}\nExplain why ${correctAnswer} is correct.`;

  try {
    return await callGroq(system, user, 200);
  } catch (err) {
    console.error("explainAnswer fallback:", err.message);
    return `The correct answer is ${correctAnswer}. Keep practicing similar questions to master this topic!`;
  }
}

export async function getStudyTip(subject, weakTopics) {
  const system = "You are a JAMB/WAEC Nigerian exam coach.";
  const user = `Student is weak in ${subject}. Topics: ${weakTopics.join(", ")}. Give 3 tips.`;
  try {
    return await callGroq(system, user, 150);
  } catch (err) {
    console.error("getStudyTip fallback:", err.message);
    return `Focus on past questions for ${weakTopics[0]}. Practice consistently every day. Review your notes and join study groups.`;
  }
}

export async function getDailyQuote() {
  const system = "You write motivational quotes for Nigerian students.";
  const user = "Give one motivational quote.";
  try {
    return await callGroq(system, user, 50);
  } catch (err) {
    console.error("getDailyQuote fallback:", err.message);
    return "Every question you practice today is a problem you won't face on exam day. Keep pushing!";
  }
}

export async function predictLikelyQuestions({ subject, exam, count = 6 }) {
  const system = `You are a ${exam} expert. Predict likely topics for ${subject}. Return ONLY valid JSON array, no markdown fences.`;
  const user = `Predict ${count} topics. Return JSON array like: [{"topic":"...","likelihood":"...","reason":"...","sampleQuestion":"..."}]`;
  try {
    const res = await callGroq(system, user, 800);
    return JSON.parse(stripJsonFences(res));
  } catch (err) {
    console.error("predictLikelyQuestions fallback:", err.message);
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
    const res = await callGroq(system, user, 1500);
    return JSON.parse(stripJsonFences(res));
  } catch (err) {
    console.error("generateStudyPlan fallback:", err.message);
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