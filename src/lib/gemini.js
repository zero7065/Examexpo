const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function explainQuestion({ question, options, correctAnswer, userAnswer, subject, topic }) {
  if (!GEMINI_API_KEY) return "AI Tutor is not configured. Add VITE_GEMINI_API_KEY to your .env file.";

  const prompt = `You are ExamPadi AI, an expert Nigerian exam tutor specializing in JAMB and WAEC.

A student answered a ${subject} question incorrectly.

Question: ${question}
Options: ${JSON.stringify(options)}
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswer}
Topic: ${topic}

Give a clear, friendly explanation in 3-4 sentences. Explain WHY ${correctAnswer} is correct, and briefly why the student's choice was wrong. Use simple language suitable for SS3 Nigerian students. End with a memory tip.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return "AI explanation unavailable right now. Try again.";
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Explanation unavailable.";
  } catch (e) {
    console.error("Gemini fetch error:", e);
    return "AI unavailable. Check your connection and try again.";
  }
}