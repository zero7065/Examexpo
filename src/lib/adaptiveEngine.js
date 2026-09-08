import { getQuestionsFromBank } from '../data/questionBank';

const STORAGE_PREFIX = 'ep_adaptive_';
const MAX_REPEAT = 5;
const HISTORY_WINDOW = 5;

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

const DIFFICULTY_DISTRIBUTION = {
  easy: { easy: 0.6, medium: 0.3, hard: 0.1 },
  medium: { easy: 0.3, medium: 0.5, hard: 0.2 },
  hard: { easy: 0.1, medium: 0.3, hard: 0.6 },
};

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`;
}

function loadPerformance(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function savePerformance(userId, data) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
}

function getSubjectPerformance(userId, subject) {
  const all = loadPerformance(userId);
  return all[subject] || {
    difficulty: 'easy',
    correctRate: 0,
    totalAttempts: 0,
    lastTopics: [],
    questionHistory: [],
  };
}

function updateSubjectPerformance(userId, subject, updates) {
  const all = loadPerformance(userId);
  const current = all[subject] || {
    difficulty: 'easy',
    correctRate: 0,
    totalAttempts: 0,
    lastTopics: [],
    questionHistory: [],
  };
  all[subject] = { ...current, ...updates };
  savePerformance(userId, all);
}

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function selectByDistribution(pool, distribution, count) {
  const byDifficulty = { easy: [], medium: [], hard: [] };
  pool.forEach(q => {
    if (byDifficulty[q.difficulty]) {
      byDifficulty[q.difficulty].push(q);
    }
  });

  const selected = [];
  const target = {
    easy: Math.round(count * distribution.easy),
    medium: Math.round(count * distribution.medium),
    hard: count - Math.round(count * distribution.easy) - Math.round(count * distribution.medium),
  };

  for (const diff of DIFFICULTY_ORDER) {
    const available = shuffleArray(byDifficulty[diff]);
    const take = Math.min(target[diff], available.length);
    selected.push(...available.slice(0, take));
  }

  while (selected.length < count && pool.length > 0) {
    const remaining = pool.filter(q => !selected.includes(q));
    if (remaining.length === 0) break;
    selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
  }

  return shuffleArray(selected).slice(0, count);
}

function filterByRepeatLimit(questions, history) {
  const counts = {};
  history.forEach(id => {
    counts[id] = (counts[id] || 0) + 1;
  });

  return questions.filter(q => {
    const timesUsed = counts[q.id] || 0;
    return timesUsed < MAX_REPEAT;
  });
}

function filterByRecentTopics(questions, lastTopics) {
  if (!lastTopics || lastTopics.length === 0) return questions;

  const recent = lastTopics.slice(-HISTORY_WINDOW);
  const fresh = questions.filter(q => !recent.includes(q.topic));
  const stale = questions.filter(q => recent.includes(q.topic));

  if (fresh.length === 0) return questions;
  return [...shuffleArray(fresh), ...shuffleArray(stale)];
}

export function getAdaptiveQuestions(subject, count, userId) {
  const performance = getSubjectPerformance(userId, subject);
  const distribution = DIFFICULTY_DISTRIBUTION[performance.difficulty];

  let pool = getQuestionsFromBank({ subject, count: 100 });

  pool = filterByRepeatLimit(pool, performance.questionHistory);

  if (pool.length === 0) {
    pool = getQuestionsFromBank({ subject, count: 100 });
    updateSubjectPerformance(userId, subject, { questionHistory: [] });
  }

  pool = filterByRecentTopics(pool, performance.lastTopics);

  const selected = selectByDistribution(pool, distribution, count);

  const updatedHistory = [...performance.questionHistory, ...selected.map(q => q.id)];
  const updatedTopics = [...performance.lastTopics, ...selected.map(q => q.topic)].slice(-HISTORY_WINDOW * 2);

  updateSubjectPerformance(userId, subject, {
    questionHistory: updatedHistory,
    lastTopics: updatedTopics,
  });

  return selected;
}

export function updateAfterSession(userId, subject, scorePercentage) {
  const performance = getSubjectPerformance(userId, subject);
  const newTotal = performance.totalAttempts + 1;
  const previousWeight = performance.totalAttempts / newTotal;
  const newWeight = 1 / newTotal;
  const newCorrectRate = (performance.correctRate * previousWeight) + (scorePercentage * newWeight);

  let newDifficulty = performance.difficulty;
  const diffIndex = DIFFICULTY_ORDER.indexOf(performance.difficulty);

  if (scorePercentage >= 80 && diffIndex < DIFFICULTY_ORDER.length - 1) {
    newDifficulty = DIFFICULTY_ORDER[diffIndex + 1];
  } else if (scorePercentage < 40 && diffIndex > 0) {
    newDifficulty = DIFFICULTY_ORDER[diffIndex - 1];
  }

  updateSubjectPerformance(userId, subject, {
    difficulty: newDifficulty,
    correctRate: newCorrectRate,
    totalAttempts: newTotal,
  });

  return { difficulty: newDifficulty, correctRate: newCorrectRate, totalAttempts: newTotal };
}

export function getRecommendation(userId) {
  const all = loadPerformance(userId);
  const subjects = Object.keys(all);

  if (subjects.length === 0) {
    return { subject: null, difficulty: 'easy', reason: 'No performance data yet. Start practicing!' };
  }

  let weakestSubject = subjects[0];
  let lowestRate = all[subjects[0]].correctRate;

  for (const sub of subjects) {
    if (all[sub].correctRate < lowestRate) {
      lowestRate = all[sub].correctRate;
      weakestSubject = sub;
    }
  }

  const weakest = all[weakestSubject];

  if (weakest.correctRate >= 80) {
    const hardestSubject = subjects.reduce((a, b) =>
      all[a].correctRate > all[b].correctRate ? a : b
    );
    const hardest = all[hardestSubject];
    return {
      subject: hardestSubject,
      difficulty: hardest.difficulty,
      reason: `You're excelling at ${weakestSubject}. Try pushing further in ${hardestSubject}.`,
    };
  }

  return {
    subject: weakestSubject,
    difficulty: weakest.difficulty,
    reason: `${weakestSubject} needs attention with ${Math.round(weakest.correctRate * 100)}% accuracy.`,
  };
}

export function resetProgress(userId, subject) {
  const all = loadPerformance(userId);
  delete all[subject];
  savePerformance(userId, all);
}
