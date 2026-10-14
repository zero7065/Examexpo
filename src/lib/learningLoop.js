// src/lib/learningLoop.js — studies student activity, spots repeated failure
// patterns, and prescribes escalating countermeasures until fixed.
// Pure functions: callers pass sessions + memory; no Firestore coupling.
import { topWeakTopics } from "./aiMemory";

// Aggregate per-topic correct/total across sessions' questionLogs.
export function topicStatsFromSessions(sessions = []) {
  const agg = {};
  for (const s of sessions) {
    const logs = s.questionLog || [];
    for (const l of logs) {
      const key = `${l.s || l.subject || "General"}::${l.t || l.topic || "General"}`;
      agg[key] = agg[key] || { subject: l.s || l.subject || "General", topic: l.t || l.topic || "General", c: 0, t: 0 };
      agg[key].t += 1;
      if (l.ok) agg[key].c += 1;
    }
  }
  return Object.values(agg).map((a) => ({ ...a, acc: a.t ? Math.round((a.c / a.t) * 100) : null }));
}

// Detect patterns. Returns [{ kind, subject, topic, detail, severity }].
export function detectPatterns({ sessions = [], memory = null }) {
  const patterns = [];
  const stats = topicStatsFromSessions(sessions);

  // 1) Repeated failure: same topic wrong 3+ times with <50% accuracy, 5+ attempts
  for (const s of stats) {
    if (s.t >= 5 && s.acc !== null && s.acc < 50 && s.t - s.c >= 3) {
      patterns.push({
        kind: "repeated_failure",
        subject: s.subject,
        topic: s.topic,
        detail: `${s.t - s.c} misses in ${s.t} attempts (${s.acc}%)`,
        severity: s.acc < 30 ? "high" : "medium",
      });
    }
  }

  // 2) Slipping: last-3-session accuracy ≥15pts below earlier average
  if (sessions.length >= 5) {
    const pct = (s) => (s.total > 0 ? Math.round(((s.correct || 0) / s.total) * 100) : null);
    const scores = sessions.map(pct).filter((x) => x !== null);
    if (scores.length >= 5) {
      const recent = scores.slice(-3);
      const older = scores.slice(0, -3);
      const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
      if (avg(older) - avg(recent) >= 15) {
        patterns.push({
          kind: "slipping",
          subject: "Overall",
          topic: "Recent form",
          detail: `Down from ${Math.round(avg(older))}% to ${Math.round(avg(recent))}%`,
          severity: "medium",
        });
      }
    }
  }

  // 3) Cross-check memory weak topics not yet covered by recent sessions
  const weak = topWeakTopics(memory, 5);
  for (const w of weak) {
    const covered = stats.some(
      (s) => s.subject === w.subject && s.topic === w.topic && s.t >= 3
    );
    if (!covered && (w.errorCount || 0) >= 2) {
      patterns.push({
        kind: "unaddressed_weakness",
        subject: w.subject,
        topic: w.topic,
        detail: `${w.errorCount} recorded errors, no focused practice yet`,
        severity: "low",
      });
    }
  }

  const rank = { high: 0, medium: 1, low: 2 };
  return patterns.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

// Map a pattern to an escalating countermeasure (level 1→3 by repeat count).
// seenCounts: { "subject::topic::kind": timesShown } persisted by caller.
export function prescribeCountermeasure(pattern, seenCount = 0) {
  const level = Math.min(seenCount + 1, 3);
  const { subject, topic } = pattern;

  if (pattern.kind === "repeated_failure") {
    if (level === 1) {
      return {
        level, title: `🎯 Target drill: ${topic}`,
        body: `${pattern.detail}. Do a focused 10-question ${subject} set on this topic now.`,
        action: { label: "Start targeted practice", to: "/practice-select" },
      };
    }
    if (level === 2) {
      return {
        level, title: `🃏 Still stuck on ${topic}? Switch tactics`,
        body: "Same misses again. Generate flashcards for this topic, then ask the AI Tutor to explain it like you're 10.",
        action: { label: "Make flashcards", to: "/flashcards" },
      };
    }
    return {
      level, title: `🧠 Deep rescue: ${topic}`,
      body: "This topic keeps beating you. Open the AI Tutor, paste one missed question, and work it step-by-step until you can teach it back.",
      action: { label: "Open AI Tutor", to: "/ai-tutor" },
    };
  }

  if (pattern.kind === "slipping") {
    return {
      level, title: "📉 Form dip spotted",
      body: `${pattern.detail}. Countermove: one easy timed session to rebuild rhythm, then review every miss with AI explanations.`,
      action: { label: "Quick timed session", to: "/practice-select" },
    };
  }

  return {
    level, title: `📌 Unaddressed: ${topic}`,
    body: `${pattern.detail}. Add it to your next session via the Question Bank topic filter.`,
    action: { label: "Open Question Bank", to: "/question-bank" },
  };
}

// Full pass: patterns + prescribed countermeasures.
export function analyzeLearning({ sessions = [], memory = null, seenCounts = {} }) {
  return detectPatterns({ sessions, memory }).map((p) => ({
    pattern: p,
    rx: prescribeCountermeasure(p, seenCounts[`${p.subject}::${p.topic}::${p.kind}`] || 0),
  }));
}
