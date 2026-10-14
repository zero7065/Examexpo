// Wellness content: health tips + mid-activity motivation.
// Rotated deterministically (no AI cost) during practice and on dashboards.

export const HEALTH_TIPS = [
  { icon: "💧", title: "Hydrate your brain", body: "Sip water every 25 minutes. Even mild dehydration drops concentration and memory recall." },
  { icon: "😴", title: "Protect your sleep", body: "7–8 hours nightly. Your brain files what you studied into long-term memory while you sleep — all-nighters erase gains." },
  { icon: "👀", title: "Rest your eyes", body: "Every 20 minutes, look 20 feet away for 20 seconds (the 20-20-20 rule). Crucial before long CBT sessions." },
  { icon: "🧘", title: "Breathe before exams", body: "4 counts in, 6 counts out, three times. It lowers heart rate and clears panic in under a minute." },
  { icon: "🍌", title: "Eat for focus", body: "Bananas, groundnuts, eggs and water beat heavy oily food before study or exams. Sugar spikes crash you mid-paper." },
  { icon: "🚶", title: "Move between sessions", body: "A 5-minute walk or stretch resets attention better than scrolling your phone." },
  { icon: "📵", title: "Phone away, scores up", body: "Put the phone face-down in another room during 25-minute focus sprints. Out of sight really works." },
  { icon: "🌅", title: "Morning is golden", body: "Tackle your hardest topic in the first study block — willpower and memory are freshest before noon." },
];

export const MOTIVATORS = [
  "Small boy, big brain. One more question. 🧠",
  "JAMB rewards the consistent, not the brilliant. Keep going. 🔥",
  "Every mistake you review now is a mark you bank later. 💰",
  "Your future self is watching — make them proud. 👀",
  "Tough topics fear repetition. Hit it again. 🥊",
  "300+ scorers aren't smarter. They just didn't stop. 🚀",
  "Breathe. Read twice. Then strike. 🎯",
  "Nobody is coming to save you — and that's your superpower. 💪",
  "One topic at a time. Giants fall that way. 🏔️",
  "Wetin you practice today, exam no fit surprise you. 🇳🇬",
  "Slow is smooth, smooth is fast. Keep your rhythm. 🥁",
  "The leaderboard remembers effort. Climb one spot today. 🧗",
];

// Deterministic pick (stable per key, e.g. per day or per session index)
export function pickCycled(list, key) {
  if (!list.length) return null;
  let h = 0;
  const s = String(key);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

export function dailyHealthTip(dateStr) {
  return pickCycled(HEALTH_TIPS, `health-${dateStr}`);
}

export function motivatorFor(sessionIdx, questionIdx) {
  return pickCycled(MOTIVATORS, `m-${sessionIdx}-${questionIdx}`);
}
