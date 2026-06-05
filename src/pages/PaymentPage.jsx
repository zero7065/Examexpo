// src/pages/PaymentPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { PLANS, initiatePayment } from "../paystack";
import { Check, Crown, Zap, ShieldCheck, Sparkles, ChevronRight, Loader2, Award } from "lucide-react";
import { logActivity } from "../lib/activityLog";

const PaymentPage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState(null);

  const activatePro = async (planId, duration, reference) => {
    const expiryDate = new Date();
    expiryDate.setHours(23, 59, 59, 999);
    expiryDate.setDate(expiryDate.getDate() + duration);

    updateUser({
      plan: planId.includes('pro') ? 'pro' : 'free',
      planExpiry: expiryDate.toISOString()
    });

    if (db && user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          subscription: {
            plan: planId,
            status: "active",
            reference,
            startDate: serverTimestamp(),
            endDate: expiryDate,
            autoRenew: true,
          },
        });
      } catch (e) {
        console.warn("Failed to write subscription to Firestore:", e);
      }
    }
  };

  const handlePayment = async (plan) => {
    if (!user) return navigate("/auth");
    setPayLoading(true);
    setPayError(null);
    toast({ message: "Opening payment...", type: "info" });

    await initiatePayment({
      email: user.email,
      plan,
      userUid: user.uid,
      userName: user.name || user.displayName,
      onSuccess: async (response) => {
        setPayLoading(true);
        try {
          await activatePro(plan.id, plan.duration, response.reference);
          logActivity({ action: "payment", userId: user.uid, email: user.email, details: { plan: plan.id, planName: plan.name, reference: response.reference } });
          toast({ message: `Payment successful! You're now Pro 🎉`, type: "success" });
          navigate("/payment/success");
        } catch (err) {
          toast({ message: 'Activation failed. Please contact support.', type: "error" });
        } finally {
          setPayLoading(false);
        }
      },
      onClose: () => {
        setPayLoading(false);
        toast({ message: "Payment cancelled.", type: "info" });
      },
      onError: (err) => {
        setPayLoading(false);
        setPayError(err.message);
        toast({ message: err.message, type: "error" });
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-16 animate-fade">
      <header className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-accent/20">
          <Crown size={14} />
          <span>Go Unlimited with ExamPadi Pro</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-text tracking-tight">Unlock Your Full Potential</h1>
        <p className="text-text-muted text-xl max-w-2xl mx-auto font-medium">Don't let the 30-question daily limit hold you back. Join the 300+ score squad today.</p>
      </header>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {Object.values(PLANS).map((plan) => (
          <div 
            key={plan.id}
            className={`glass-card p-10 relative overflow-hidden flex flex-col group transition-all duration-500 hover:-translate-y-2 ${
              plan.badge ? 'border-primary/40 ring-1 ring-primary/20 bg-primary-dim' : 'border-border'
            }`}
          >
            {plan.badge && (
              <div className="absolute top-0 right-0 bg-primary text-black font-black text-[10px] px-6 py-2 uppercase tracking-widest rounded-bl-2xl">
                {plan.badge}
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-black mb-2 text-text">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black font-mono tracking-tighter">{plan.displayPrice}</span>
                <span className="text-text-muted font-bold text-sm">/ {plan.duration === 365 ? 'yr' : plan.duration === 90 ? '3mo' : 'mo'}</span>
              </div>
              {plan.savings && (
                <div className="text-primary font-black text-xs uppercase mt-2 tracking-widest">{plan.savings}</div>
              )}
            </div>

            <div className="space-y-4 flex-1 mb-10">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 text-sm font-medium">
                  <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary mt-0.5 shrink-0">
                    <Check size={14} />
                  </div>
                  <span className="text-text-muted">{feature}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 w-full">
              <button 
                onClick={() => handlePayment(plan)}
                disabled={payLoading}
                className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${
                  plan.badge 
                  ? 'bg-primary text-black shadow-primary/20 hover:scale-105' 
                  : 'bg-bg-3 text-text border border-border hover:bg-border'
                }`}
              >
                {payLoading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    Pay {plan.displayPrice}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
              {payError && <p className="text-danger text-[13px] text-center font-bold">⚠️ {payError}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-border">
        <TrustItem icon={<ShieldCheck size={24} />} title="Secure Checkout" label="Paystack Encrypted" />
        <TrustItem icon={<Zap size={24} />} title="Instant Access" label="Automated Activation" />
        <TrustItem icon={<Sparkles size={24} />} title="Premium Support" label="Priority AI Analysis" />
        <TrustItem icon={<Award size={24} />} title="Score Guarantee" label="Proven Study Method" />
      </div>
    </div>
  );
};

const TrustItem = ({ icon, title, label }) => (
  <div className="flex flex-col items-center text-center space-y-2">
    <div className="text-primary mb-2 opacity-60">{icon}</div>
    <div className="font-bold text-sm text-text">{title}</div>
    <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</div>
  </div>
);

export default PaymentPage;
