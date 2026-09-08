// src/pages/PaymentPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { loadPaystack } from "../paystack";
import { PLANS as CONFIG_PLANS } from "../config/plans";
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

    if (db && user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          subscription: {
            plan: planId,
            status: "active",
            reference,
            startDate: serverTimestamp(),
            endDate: expiryDate.toISOString(),
            autoRenew: true,
          },
        });
      } catch (e) {
        console.warn("Failed to write subscription:", e);
      }
    }

    try {
      updateUser({
        plan: planId.includes("pro") ? "pro" : "free",
        planExpiry: expiryDate.toISOString(),
      });
    } catch (e) {
      console.warn("Failed to update AuthContext:", e);
    }
  };

  const handlePayment = async (planKey) => {
    if (!user) return navigate("/auth");

    const planConfig = CONFIG_PLANS[planKey];
    if (!planConfig || planConfig.price <= 0) {
      toast({ message: "Invalid plan selected.", type: "error" });
      return;
    }

    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast({ message: "Paystack key missing. Add VITE_PAYSTACK_PUBLIC_KEY to .env.", type: "error" });
      return;
    }

    setPayLoading(true);
    setPayError(null);
    toast({ message: "Opening payment...", type: "info" });

    try {
      await loadPaystack();
    } catch (err) {
      setPayLoading(false);
      toast({ message: err.message, type: "error" });
      return;
    }

    if (typeof window.PaystackPop === "undefined") {
      setPayLoading(false);
      toast({ message: "Payment system not loaded. Check connection.", type: "error" });
      return;
    }

    const reference = `EP-${user.uid}-${Date.now()}`;
    const amount = planConfig.price * 100;

    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: user.email,
        amount,
        ref: reference,
        currency: "NGN",
        metadata: { userId: user.uid, plan: planKey, userName: user.displayName || "Student" },
        callback: async function (response) {
          try {
            const duration = planKey === "pro_yearly" ? 365 : 30;
            await activatePro(planKey, duration, response.reference);
            logActivity({ action: "payment", userId: user.uid, email: user.email, details: { plan: planKey, reference: response.reference } });
            toast({ message: "Payment successful! You're now Pro", type: "success" });
            navigate("/payment/success");
          } catch (err) {
            toast({ message: "Activation failed. Contact support.", type: "error" });
          } finally {
            setPayLoading(false);
          }
        },
        onClose: function () {
          setPayLoading(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      setPayLoading(false);
      const msg = "Failed to open payment. " + (err.message || "Try again.");
      setPayError(msg);
      toast({ message: msg, type: "error" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-16 animate-fade">
      <header className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-accent/20">
          <Crown size={14} />
          <span>Go Unlimited with ExamPadi Pro</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-text tracking-tight">Unlock Your Full Potential</h1>
        <p className="text-text-muted text-xl max-w-2xl mx-auto font-medium">Don't let the daily question limit hold you back. Join the 300+ score squad today.</p>
      </header>

      {/* Plans Grid - Pro only */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[
          { key: "pro_monthly", ...CONFIG_PLANS.pro_monthly },
          { key: "pro_yearly", ...CONFIG_PLANS.pro_yearly },
        ].map((plan) => (
          <div
            key={plan.key}
            className={`glass-card p-8 md:p-10 relative overflow-hidden flex flex-col group transition-all duration-500 hover:-translate-y-2 ${
              plan.badge ? "border-primary/40 ring-1 ring-primary/20 bg-primary-dim" : "border-border"
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
                <span className="text-5xl font-black font-mono tracking-tighter">
                  ₦{plan.price.toLocaleString()}
                </span>
                <span className="text-text-muted font-bold text-sm">
                  / {plan.interval === "yearly" ? "yr" : "mo"}
                </span>
              </div>
              {plan.key === "pro_yearly" && (
                <div className="text-primary font-black text-xs uppercase mt-2 tracking-widest">
                  Save ₦{(CONFIG_PLANS.pro_monthly.price * 12 - plan.price).toLocaleString()}
                </div>
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
                onClick={() => handlePayment(plan.key)}
                disabled={payLoading}
                className={`w-full h-14 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${
                  plan.badge
                    ? "bg-primary text-black shadow-primary/20 hover:scale-105"
                    : "bg-bg-3 text-text border border-border hover:bg-border"
                }`}
              >
                {payLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Pay ₦{plan.price.toLocaleString()}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
              {payError && <p className="text-danger text-[13px] text-center font-bold">{payError}</p>}
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
