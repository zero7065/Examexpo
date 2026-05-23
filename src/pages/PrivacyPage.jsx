// src/pages/PrivacyPage.jsx
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

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
          <p className="text-text-muted text-sm">Last updated: May 2025</p>
        </div>
      </div>

      <div className="space-y-8 text-text-muted leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-text mb-3">1. Who We Are</h2>
          <p>ExamPadi AI is operated by Jadai Studios. We build AI-powered study tools for Nigerian students preparing for JAMB and WAEC exams. Contact us at: <a href="mailto:jadai7065@gmail.com" className="text-primary hover:underline">jadai7065@gmail.com</a></p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">2. Data We Collect</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Email address and name (from sign-up)</li>
            <li>Google account info (if you sign in with Google)</li>
            <li>Practice session data: subjects practiced, scores, time spent</li>
            <li>Payment records processed via Paystack (we do not store card details)</li>
            <li>Device type and browser (via Firebase Analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">3. How We Use Your Data</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To provide personalized study recommendations</li>
            <li>To track your progress and streaks</li>
            <li>To process payments and manage your subscription</li>
            <li>To display anonymized activity on our platform (e.g. "A student from Lagos scored 90%")</li>
            <li>To improve our AI question generation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">4. Data Sharing</h2>
          <p>We do not sell your data. We share data only with:</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li><strong>Firebase / Google</strong> — for authentication, database, and hosting</li>
            <li><strong>Paystack</strong> — for payment processing</li>
            <li><strong>Groq AI API</strong> — for AI explanations (no personal data is sent)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">5. Your Rights</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Request a copy of your data</li>
            <li>Request deletion of your account and all associated data</li>
            <li>Opt out of non-essential communications</li>
          </ul>
          <p className="mt-2">Email <a href="mailto:jadai7065@gmail.com" className="text-primary hover:underline">jadai7065@gmail.com</a> for any of the above.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">6. Minors</h2>
          <p>ExamPadi AI is intended for students aged 15 and above. We do not knowingly collect data from children under 13. If you believe a child has registered, contact us immediately.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">7. Cookies</h2>
          <p>We use Firebase session cookies for authentication. No third-party advertising cookies are used.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-text mb-3">8. Changes</h2>
          <p>We may update this policy. Changes will be posted on this page with an updated date.</p>
        </section>
      </div>

      <div className="mt-16 pt-8 border-t border-border text-center">
        <p className="text-text-muted text-sm">© 2025 ExamPadi AI by Jadai Studios · <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link></p>
      </div>
    </div>
  );
}
