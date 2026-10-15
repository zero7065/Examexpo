// src/pages/PaymentSuccess.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import confetti from "canvas-confetti";
import { Crown, CheckCircle2, ChevronRight, Sparkles, Zap, Award, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePaystack, readLastPayment } from "../hooks/usePaystack";
import { useToast } from "../components/Toast";

const PaymentSuccess = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { verifyPayment } = usePaystack();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  const last = readLastPayment();
  const reference =
    location.state?.reference || last?.reference || null;
  const plan = location.state?.plan || last?.plan || null;
  const activated = location.state?.activated !== false;

  useEffect(() => {
    if (!reference) return;
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, [reference]);

  async function handleVerify() {
    if (!user || !reference) return;
    setVerifying(true);
    try {
      await verifyPayment(reference, plan, user.uid);
      setVerified(true);
    } catch (e) {
      console.error("Recovery verification failed:", e);
      toast({ message: e?.message || "Could not verify this payment. Contact support on WhatsApp +234 812 763 6057.", type: "error", duration: 8000 });
    } finally {
      setVerifying(false);
    }
  }

  const done = verified || activated;

  return (
    <div className="md:-ml-64 min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden font-sora">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-md w-full glass-card p-12 text-center space-y-10 border-2 border-primary/30 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12">
            <Crown size={48} className="text-black" />
          </div>
        </div>

        <div className="pt-10 space-y-4">
          <h1 className="text-4xl font-black text-text tracking-tight">
            {done ? "You're Pro!" : "Payment Received"}
          </h1>
          <p className="text-text-muted font-medium leading-relaxed">
            {done
              ? "Payment verified. Your account has been upgraded. Welcome to the elite squad of high-scoring candidates."
              : "We received your payment but activation didn't finish. Press Verify below — do NOT pay again."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <BenefitItem icon={<Zap size={18} />} label="Unlimited Questions" />
          <BenefitItem icon={<Sparkles size={18} />} label="AI Analysis" />
          <BenefitItem icon={<Award size={18} />} label="Exam Mode" />
          <BenefitItem icon={<CheckCircle2 size={18} />} label="Priority Access" />
        </div>

        {!done && (
          <button
            onClick={handleVerify}
            disabled={verifying || !user || !reference}
            className="btn-primary w-full h-14 text-lg disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {verifying ? (
              <><Loader2 className="animate-spin" size={20} /> Verifying with Paystack…</>
            ) : (
              <><ShieldCheck size={20} /> Verify & activate my account</>
            )}
          </button>
        )}

        <div className="pt-4 space-y-4">
          <Link to="/dashboard" className="btn-primary w-full h-16 text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
            Enter Dashboard
            <ChevronRight size={24} />
          </Link>
          {reference ? (
            <p className="text-text-muted text-[10px] font-black uppercase tracking-widest break-all">
              Transaction Ref: {reference}
            </p>
          ) : (
            <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">
              No transaction reference found on this device
            </p>
          )}
          <p className="text-text-muted text-[11px] font-semibold">
            Trouble? WhatsApp <a className="text-primary" href="https://wa.me/2348127636057" target="_blank" rel="noopener noreferrer">+234 812 763 6057</a> with your reference.
          </p>
        </div>
      </div>
    </div>
  );
};

const BenefitItem = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-2 p-4 bg-primary-dim rounded-2xl border border-primary/10">
    <div className="text-primary">{icon}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</div>
  </div>
);

export default PaymentSuccess;
