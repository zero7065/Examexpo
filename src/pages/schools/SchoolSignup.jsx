// School signup: creates a pending schools/{id} doc; admin approves.
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LandingStyles from "../../components/landing/LandingStyles";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/Toast";
import { createSchoolRequest } from "../../lib/schools";
import { ArrowLeft, Send } from "lucide-react";

const STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

export default function SchoolSignup() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    schoolName: "", state: "Lagos", lga: "", type: "private",
    studentCount: "", contactName: "", contactEmail: "", contactPhone: "", contactRole: "Proprietor",
  });

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.schoolName.trim() || !form.contactName.trim() || !form.contactEmail.trim() || !form.contactPhone.trim()) {
      toast({ message: "Please fill all required fields", type: "warning" });
      return;
    }
    setSending(true);
    try {
      const id = await createSchoolRequest({
        ...form,
        requestedBy: user?.uid || null,
        contactEmail: form.contactEmail.trim(),
      });
      toast({ message: "School registered! We'll review and contact you shortly.", type: "success" });
      navigate("/schools", { replace: true });
      void id;
    } catch (err) {
      toast({ message: `Registration failed: ${err.message}`, type: "error" });
    } finally {
      setSending(false);
    }
  }

  const input = "input-field";

  return (
    <div className="landing-page">
      <LandingStyles />
      <div className="lp-container" style={{ maxWidth: 640, paddingTop: 100, paddingBottom: 80 }}>
        <Link to="/schools" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
          <ArrowLeft size={16} /> Back to Schools
        </Link>
        <h1 className="lp-h2">Register your <span className="lp-gradient-text">school</span></h1>
        <p className="lp-sub" style={{ marginBottom: 28 }}>Approval usually takes 1–2 business days. Status: pending review.</p>
        <form onSubmit={submit} className="lp-glass" style={{ borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 700 }}>School name *
            <input value={form.schoolName} onChange={(e) => set("schoolName", e.target.value)} placeholder="e.g. Corona Secondary School" className={input} style={{ marginTop: 6 }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>State
              <select value={form.state} onChange={(e) => set("state", e.target.value)} className={input} style={{ marginTop: 6 }}>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 13, fontWeight: 700 }}>LGA
              <input value={form.lga} onChange={(e) => set("lga", e.target.value)} placeholder="e.g. Ikeja" className={input} style={{ marginTop: 6 }} />
            </label>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>School type
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={input} style={{ marginTop: 6 }}>
                <option value="private">Private</option>
                <option value="public">Public</option>
                <option value="federal">Federal / Unity</option>
              </select>
            </label>
            <label style={{ fontSize: 13, fontWeight: 700 }}>Students
              <input value={form.studentCount} onChange={(e) => set("studentCount", e.target.value)} placeholder="e.g. 350" inputMode="numeric" className={input} style={{ marginTop: 6 }} />
            </label>
          </div>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Contact person *
            <input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Full name" className={input} style={{ marginTop: 6 }} />
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700 }}>Contact email *
              <input type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="you@school.com" className={input} style={{ marginTop: 6 }} />
            </label>
            <label style={{ fontSize: 13, fontWeight: 700 }}>Contact phone *
              <input value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="080..." className={input} style={{ marginTop: 6 }} />
            </label>
          </div>
          <label style={{ fontSize: 13, fontWeight: 700 }}>Your role
            <select value={form.contactRole} onChange={(e) => set("contactRole", e.target.value)} className={input} style={{ marginTop: 6 }}>
              <option>Proprietor</option>
              <option>Principal</option>
              <option>Vice Principal</option>
              <option>Teacher</option>
              <option>Administrator</option>
              <option>Other</option>
            </select>
          </label>
          <button type="submit" disabled={sending} className="lp-btn-primary" style={{ justifyContent: "center", border: "none", cursor: "pointer", opacity: sending ? 0.7 : 1 }}>
            {sending ? "Submitting…" : <><Send size={16} /> Submit for approval</>}
          </button>
        </form>
      </div>
    </div>
  );
}
