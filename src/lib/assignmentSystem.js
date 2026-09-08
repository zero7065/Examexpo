import { getQuestionsFromBank } from "../data/questionBank";

function getStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return `asgn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateAssignmentQuestions(subject, count) {
  const questions = getQuestionsFromBank({ subject, count });
  return questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
  }));
}

export function createAssignment(userId, subject, weakTopics) {
  const key = `ep_assignments_${userId}`;
  const assignments = getStorage(key) || [];
  const count = 25;
  const questions = generateAssignmentQuestions(subject, count);
  const now = Date.now();

  const assignment = {
    id: generateId(),
    subject,
    weakTopics: weakTopics || [],
    questions,
    timeLimit: 1500,
    deadline: now + 1500 * 1000,
    status: "pending",
    createdAt: now,
    answers: null,
    score: null,
  };

  assignments.push(assignment);
  setStorage(key, assignments);
  return assignment;
}

export function getActiveAssignment(userId) {
  const assignments = getStorage(`ep_assignments_${userId}`) || [];
  return (
    assignments.find(
      (a) => a.status === "pending" || a.status === "active"
    ) || null
  );
}

export function startAssignment(userId, assignmentId) {
  const key = `ep_assignments_${userId}`;
  const assignments = getStorage(key) || [];
  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx < 0) return null;

  assignments[idx].status = "active";
  assignments[idx].startedAt = Date.now();
  setStorage(key, assignments);
  return assignments[idx];
}

export function submitAssignment(userId, assignmentId, answers) {
  const key = `ep_assignments_${userId}`;
  const assignments = getStorage(key) || [];
  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx < 0) return null;

  const assignment = assignments[idx];
  let correct = 0;

  assignment.questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) correct++;
  });

  const total = assignment.questions.length;
  const score = Math.round((correct / total) * 100);
  assignment.answers = answers;
  assignment.score = score;
  assignment.correctCount = correct;
  assignment.submittedAt = Date.now();
  assignment.status = score >= 35 ? "passed" : "failed";

  setStorage(key, assignments);

  if (score >= 35) {
    import("./xpSystem").then(({ addXp }) => {
      addXp(userId, 30, "assignment_pass");
    });
  } else {
    createAssignment(userId, assignment.subject, assignment.weakTopics);
  }

  return assignment;
}

export function getAssignmentHistory(userId) {
  return getStorage(`ep_assignments_${userId}`) || [];
}

export function isAssignmentOverdue(assignment) {
  if (!assignment) return false;
  return Date.now() > assignment.deadline;
}
