import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("GEMINI_API_KEY is missing. AI features will not work.");
}

export const gemini = new GoogleGenAI({ apiKey: apiKey || "" });

export const ADAPTIVE_LEARNING_PROMPT = `
You are an expert JAMB/WAEC tutor. Your goal is to generate or explain questions based on a student's performance.
Always focus on clarity, accuracy, and reinforcement.
`;

export async function generateAdaptiveQuestion(
  subject: string,
  weakTopics: string[],
  difficulty: number
) {
  try {
    const response = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate a multiple-choice question for ${subject} focusing on these topics: ${weakTopics.join(", ")}. Difficulty level: ${difficulty}/5. Include options, correct index, and a clear pedagogical explanation.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctOption: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            topic: { type: Type.STRING }
          },
          required: ["text", "options", "correctOption", "explanation", "topic"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      text: `What is a key concept in ${subject} related to ${weakTopics[0] || "core topics"}?`,
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctOption: 0,
      explanation: "AI question generation unavailable. Please check your connection and try again.",
      topic: weakTopics[0] || subject
    };
  }
}
