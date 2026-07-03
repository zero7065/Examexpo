/**
 * Question Bank Seed Generator
 * Dynamically generates sample questions for low-coverage subjects
 */

export function generateSampleQuestions(subject, count = 10) {
  const templates = {
    'Further Mathematics': [
      {
        topic: 'Calculus',
        question: 'What is the derivative of ${formula}?',
        options: { A: '${opt1}', B: '${opt2}', C: '${opt3}', D: '${opt4}' },
        answer: 'A',
      },
      {
        topic: 'Complex Numbers',
        question: 'Find the modulus of ${complex}',
        options: { A: '${mod1}', B: '${mod2}', C: '${mod3}', D: '${mod4}' },
        answer: 'B',
      },
      {
        topic: 'Matrices',
        question: 'Given matrix ${matrix}, find its inverse',
        options: { A: '${inv1}', B: '${inv2}', C: '${inv3}', D: '${inv4}' },
        answer: 'C',
      },
    ],
    'Literature in English': [
      {
        topic: 'Poetry',
        question: 'Identify the literary device in: "${verse}"',
        options: { A: 'Metaphor', B: 'Simile', C: 'Personification', D: 'Alliteration' },
        answer: 'A',
      },
      {
        topic: 'Prose',
        question: 'What is the main theme of the text?',
        options: { A: 'Love', B: 'Betrayal', C: 'Redemption', D: 'Loss' },
        answer: 'C',
      },
      {
        topic: 'Drama',
        question: 'Who is the protagonist?',
        options: { A: 'Character X', B: 'Character Y', C: 'Character Z', D: 'Character W' },
        answer: 'B',
      },
    ],
    'Geography': [
      {
        topic: 'Physical Geography',
        question: 'Which rock type is ${composition}?',
        options: { A: 'Igneous', B: 'Sedimentary', C: 'Metamorphic', D: 'Volcanic' },
        answer: 'A',
      },
      {
        topic: 'Climate & Weather',
        question: 'The trade winds blow in which direction?',
        options: { A: 'North to South', B: 'South to North', C: 'East to West', D: 'West to East' },
        answer: 'C',
      },
      {
        topic: 'Human Geography',
        question: 'Which of these is a primary industry?',
        options: { A: 'Tourism', B: 'Agriculture', C: 'Manufacturing', D: 'Transport' },
        answer: 'B',
      },
    ],
    'History': [
      {
        topic: 'African History',
        question: 'In which year did ${event} occur?',
        options: { A: '1950', B: '1960', C: '1970', D: '1980' },
        answer: 'B',
      },
      {
        topic: 'World History',
        question: 'Who led ${movement}?',
        options: { A: 'Leader A', B: 'Leader B', C: 'Leader C', D: 'Leader D' },
        answer: 'A',
      },
      {
        topic: 'Political Systems',
        question: 'What is ${system}?',
        options: { A: 'Monarchy', B: 'Democracy', C: 'Dictatorship', D: 'Oligarchy' },
        answer: 'B',
      },
    ],
    'CRS': [
      {
        topic: 'Old Testament',
        question: 'Who was ${prophet}?',
        options: { A: 'A prophet', B: 'A king', C: 'A judge', D: 'An apostle' },
        answer: 'A',
      },
      {
        topic: 'New Testament',
        question: 'Which of the following is a Gospel?',
        options: { A: 'Mark', B: 'Romans', C: 'Timothy', D: 'Revelation' },
        answer: 'A',
      },
      {
        topic: 'Christian Ethics',
        question: 'What is the Golden Rule?',
        options: { A: 'Love your enemies', B: 'Treat others as you want to be treated', C: 'Follow the law', D: 'Give to charity' },
        answer: 'B',
      },
    ],
    'Agricultural Science': [
      {
        topic: 'Crop Production',
        question: 'Which nutrient is most important for ${crop}?',
        options: { A: 'Nitrogen', B: 'Phosphorus', C: 'Potassium', D: 'Calcium' },
        answer: 'A',
      },
      {
        topic: 'Animal Husbandry',
        question: 'What is the optimal temperature for ${animal}?',
        options: { A: '20°C', B: '25°C', C: '30°C', D: '35°C' },
        answer: 'B',
      },
      {
        topic: 'Soil Science',
        question: 'What does pH measure?',
        options: { A: 'Acidity', B: 'Moisture', C: 'Nutrients', D: 'Texture' },
        answer: 'A',
      },
    ],
    'Commerce': [
      {
        topic: 'Business Studies',
        question: 'What is ${term}?',
        options: { A: 'Definition A', B: 'Definition B', C: 'Definition C', D: 'Definition D' },
        answer: 'A',
      },
      {
        topic: 'Accounting',
        question: 'In double-entry bookkeeping, debits equal?',
        options: { A: 'Assets', B: 'Credits', C: 'Expenses', D: 'Revenue' },
        answer: 'B',
      },
      {
        topic: 'Marketing',
        question: 'What is the target market?',
        options: { A: 'All consumers', B: 'Identified group of customers', C: 'Competitors', D: 'Retailers' },
        answer: 'B',
      },
    ],
  };

  if (!templates[subject]) {
    console.warn(`No seed template for ${subject}`);
    return [];
  }

  const generated = [];
  const tmpl = templates[subject];

  for (let i = 0; i < Math.min(count, tmpl.length); i++) {
    generated.push({
      id: `seed_${subject.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}_${i}`,
      subject,
      exam: ['JAMB', 'WAEC'],
      year: 2026,
      difficulty: ['easy', 'medium', 'hard'][i % 3],
      ...tmpl[i],
    });
  }

  return generated;
}

export function supplementQuestions(sourceQuestions, minPerSubject = 15) {
  const bySubject = {};

  sourceQuestions.forEach(q => {
    if (!bySubject[q.subject]) bySubject[q.subject] = [];
    bySubject[q.subject].push(q);
  });

  const supplemented = [...sourceQuestions];

  for (const subject of Object.keys(bySubject)) {
    const current = bySubject[subject].length;
    if (current < minPerSubject) {
      const needed = minPerSubject - current;
      const generated = generateSampleQuestions(subject, needed);
      supplemented.push(...generated);
      console.log(`Added ${generated.length} questions for ${subject}`);
    }
  }

  return supplemented;
}

export function getMissingSubjects() {
  const covered = [
    'Use of English Language', 'Mathematics', 'Physics', 'Chemistry',
    'Biology', 'Economics', 'Government', 'English',
  ];
  
  const allSubjects = [
    'Use of English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Economics', 'Government', 'English', 'Further Mathematics', 'Literature in English',
    'Geography', 'History', 'CRS', 'Islamic Studies', 'Agricultural Science',
    'Commerce', 'Accounting', 'Technical Drawing', 'Business Management',
  ];

  return allSubjects.filter(s => !covered.includes(s));
}

export default {
  generateSampleQuestions,
  supplementQuestions,
  getMissingSubjects,
};
