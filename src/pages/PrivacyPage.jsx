// src/pages/PrivacyPage.jsx — NDPR-aligned privacy policy.
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const SECTIONS = [
  {
    h: "1. Who We Are",
    body: "ExamPadi is operated by Jadai Studios. We build AI-powered study tools for Nigerian students preparing for JAMB, WAEC, NECO and NABTEB exams. NDPR queries: jadai7065@gmail.com.",
  },
  {
    h: "2. Data We Collect",
    list: [
      "Identity: name, email address, profile photo or avatar (Google account info if you sign in with Google)",
      "Academics: exam target, subjects, school name (optional), learning-style preference",
      "Study activity: practice sessions, answers, scores, streaks, XP, achievements, AI chat messages, flashcards, notes, assignments",
      "Payments: Pro plan records processed via Paystack (we never see or store card details)",
      "Technical: device type and browser (Firebase), error reports (Sentry, if enabled)",
    ],
  },
  {
    h: "3. Why We Collect It (Legal Basis: Consent & Contract)",
    list: [
      "To provide personalized study recommendations, AI tutoring and progress tracking",
      "To operate subscriptions, leaderboards, study partners and school features",
      "To improve our questions and AI (aggregated, de-identified where possible)",
      "To comply with legal obligations and prevent abuse",
    ],
  },
  {
    h: "4. Where Your Data Lives",
    body: "Your data is stored in Google Firebase, region eur3 (European Economic Area — a GDPR-adequate region). Backups follow Google's infrastructure policies. AI prompts are processed by Groq's API; we send question text, never passwords or payment details.",
  },
  {
    h: "5. Who Can See It",
    list: [
      "You — full access via Settings → Download my data",
      "Your teacher — only your class-level study stats, if your school enrolled you",
      "Jadai Studios support — only when investigating an issue you reported",
      "Processors: Firebase/Google (hosting), Paystack (payments), Groq (AI)",
    ],
    body: "We do not sell personal data. Ever.",
  },
  {
    h: "6. Your Rights (NDPR 2019)",
    list: [
      "Access: download everything we hold — Settings → Privacy → Download my data (JSON, once daily)",
      "Correction: edit your name, subjects and school anytime in Profile/Settings",
      "Erasure: Profile → Delete Account (email confirmation). Your profile is anonymized immediately; all study data is permanently purged within 30 days",
      "Objection & withdrawal: stop using the service and request deletion at any time",
    ],
    body: "To exercise any right, use the in-app tools or email jadai7065@gmail.com. We respond within 72 hours.",
  },
  {
    h: "7. Children & Schools",
    body: "ExamPadi is intended for students aged 13 and above (16+ for government/school deployments, or younger with verifiable school/parental consent). Schools act as co-controllers for data they submit (rosters, class lists). We do not knowingly collect data from children under 13; contact us for immediate removal.",
  },
  {
    h: "8. Retention",
    body: "Active accounts: data kept while you study. Deleted accounts: anonymized at once, purged within 30 days. Anonymized learning analytics (no names, emails or IDs) may be retained for curriculum research.",
  },
  {
    h: "9. Security",
    body: "TLS in transit, Firebase access rules per-user, admin-only support access (logged), rate-limited exports, and 2MB image-only upload limits. No system is perfect — report suspected breaches to jadai7065@gmail.com immediately.",
  },
  {
    h: "10. Cookies",
    body: "Firebase session cookies for authentication only. No third-party advertising cookies.",
  },
  {
    h: "11. Changes",
    body: "Material changes will be announced in-app and dated below. Continued use after changes means acceptance.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg text-text p-6 md:p-16 max-w-3xl mx-auto">
      <Link to="/" className="text-primary text-sm font-bold mb-8 inline-flex items-center gap-2 hover:underline">
        ← Back to Home
      </Link>

      <div className="flex items-center gap-3 mb-10 mt-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-text">Privacy Policy</h1>
          <p className="text-text-muted text-sm">Last updated: October 2026 · Aligned with the Nigeria Data Protection Regulation (NDPR) 2019</p>
        </div>
      </div>

      <div className="space-y-8 text-text-muted leading-relaxed">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-bold text-text mb-3">{s.h}</h2>
            {s.body && <p>{s.body}</p>}
            {s.list && (
              <ul className="list-disc list-inside space-y-2 mt-2">
                {s.list.map((li) => <li key={li}>{li}</li>)}
              </ul>
            )}
          </section>
        ))}
        <section>
          <div className="flex gap-3 flex-wrap">
            <Link to="/settings/data-export" className="btn-secondary px-5 text-sm">Export my data</Link>
            <Link to="/profile" className="btn-secondary px-5 text-sm">Manage account</Link>
          </div>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border text-center">
        <p className="text-text-muted text-sm">© {new Date().getFullYear()} ExamPadi by Jadai Studios · <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link></p>
      </div>
    </div>
  );
}
