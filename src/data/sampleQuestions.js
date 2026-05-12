// src/data/sampleQuestions.js
export const SAMPLE_QUESTIONS = [
  {
    id: "sample1",
    subject: "Use of English Language",
    year: 2024,
    question: "Choose the option that is nearest in meaning to the underlined word: The professor's lecture was quite 'pedantic'.",
    options: {
      "A": "Interesting and engaging",
      "B": "Overly concerned with minor details and rules",
      "C": "Difficult to understand",
      "D": "Short and concise"
    },
    correctAnswer: "B",
    explanation: "Pedantic means being excessively concerned with minor details or rules, especially in teaching.",
    topic: "Lexis and Structure",
    difficulty: "medium"
  },
  {
    id: "sample2",
    subject: "Mathematics",
    year: 2024,
    question: "Solve for x in the equation: 2x + 5 = 15",
    options: {
      "A": "5",
      "B": "10",
      "C": "20",
      "D": "15"
    },
    correctAnswer: "A",
    explanation: "Subtract 5 from both sides: 2x = 10. Divide by 2: x = 5.",
    topic: "Algebra",
    difficulty: "easy"
  }
];
