// src/lib/exams.js — customizable exam list. Users can switch OFF exams
// they don't write in Settings; every exam picker in the app filters itself.
export const ALL_EXAMS = ["JAMB", "WAEC", "NECO", "NABTEB", "POST-UTME", "IELTS", "SAT"];

export function getEnabledExams(profile) {
  const list = profile?.examsEnabled;
  if (!Array.isArray(list) || list.length === 0) return [...ALL_EXAMS];
  return ALL_EXAMS.filter((e) => list.includes(e));
}

export function isExamEnabled(profile, exam) {
  return getEnabledExams(profile).includes(exam);
}
