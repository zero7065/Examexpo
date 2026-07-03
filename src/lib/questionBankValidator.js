/**
 * Question Bank Validator & Consolidation Helper
 * Verifies question counts, coverage, and suggests improvements
 */

import { QUESTION_BANK } from '../data/questionBank';
import { questions as bankQuestions } from '../data/questions/index';

export function validateQuestionBank() {
  const report = {
    timestamp: new Date().toISOString(),
    sources: {
      questionBank: analyzeQuestionBank(),
      questionsIndex: analyzeQuestionsIndex(),
    },
    coverage: {},
    warnings: [],
    suggestions: [],
  };

  // Analyze combined coverage
  const allSubjects = new Set([
    ...Object.keys(QUESTION_BANK),
    ...new Set(bankQuestions.map(q => q.subject)),
  ]);

  const MIN_QUESTIONS_PER_SUBJECT = 15; // Minimum for good practice coverage

  for (const subject of allSubjects) {
    const qbCount = (QUESTION_BANK[subject] || []).length;
    const biCount = bankQuestions.filter(q => q.subject === subject).length;
    const total = qbCount + biCount;

    report.coverage[subject] = { questionBank: qbCount, questionsIndex: biCount, total };

    if (total < MIN_QUESTIONS_PER_SUBJECT) {
      report.warnings.push(`⚠️  ${subject}: Only ${total} questions (needs ≥${MIN_QUESTIONS_PER_SUBJECT})`);
    }
    if (total === 0) {
      report.suggestions.push(`❌ ${subject}: No questions found`);
    }
  }

  // Check for duplicates by ID
  const allIds = new Set();
  const duplicateIds = [];
  
  [...Object.values(QUESTION_BANK).flat(), ...bankQuestions].forEach(q => {
    if (allIds.has(q.id)) {
      duplicateIds.push(q.id);
    }
    allIds.add(q.id);
  });

  if (duplicateIds.length > 0) {
    report.warnings.push(`⚠️  Found ${duplicateIds.length} duplicate question IDs`);
  }

  // Summary
  report.summary = {
    totalQuestions: allIds.size - duplicateIds.length,
    totalSubjects: allSubjects.size,
    subjectsWithLowCoverage: report.warnings.length,
  };

  return report;
}

function analyzeQuestionBank() {
  const analysis = {
    totalQuestions: 0,
    subjects: {},
  };

  for (const [subject, questions] of Object.entries(QUESTION_BANK)) {
    analysis.totalQuestions += (questions || []).length;
    analysis.subjects[subject] = (questions || []).length;
  }

  return analysis;
}

function analyzeQuestionsIndex() {
  const analysis = {
    totalQuestions: bankQuestions.length,
    subjects: {},
  };

  bankQuestions.forEach(q => {
    if (!analysis.subjects[q.subject]) {
      analysis.subjects[q.subject] = 0;
    }
    analysis.subjects[q.subject]++;
  });

  return analysis;
}

// Log validation on app load (if imported in main.jsx)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('📚 Question Bank Validation Report:', validateQuestionBank());
}

export function getMismatchedQuestions(subject) {
  const qbQuestions = (QUESTION_BANK[subject] || []).map(q => q.id);
  const biQuestions = bankQuestions
    .filter(q => q.subject === subject)
    .map(q => q.id);

  const duplicates = qbQuestions.filter(id => biQuestions.includes(id));
  return {
    duplicateCount: duplicates.length,
    duplicateIds: duplicates,
    uniqueInQB: qbQuestions.filter(id => !biQuestions.includes(id)).length,
    uniqueInBI: biQuestions.filter(id => !qbQuestions.includes(id)).length,
  };
}

export function getNeedsCoverage() {
  const MIN = 15;
  const report = validateQuestionBank();
  return Object.entries(report.coverage)
    .filter(([, counts]) => counts.total < MIN)
    .map(([subject, counts]) => ({
      subject,
      current: counts.total,
      needed: MIN - counts.total,
    }));
}
