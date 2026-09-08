import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { PLANS } from "../config/plans";
import { loadPaystack } from "../paystack";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";

export function usePaystack() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const { updateUser } = useAuth();

  function calculateEndDate(plan) {
    const now = new Date();
    if (plan === "pro_yearly") {
      now.setFullYear(now.getFullYear() + 1);
    } else {
      now.setMonth(now.getMonth() + 1);
    }
    return now;
  }

  async function verifyPayment(reference, plan, userId) {
    const endDate = calculateEndDate(plan);
    if (db && userId) {
      try {
        await updateDoc(doc(db, "users", userId), {
          subscription: {
            plan,
            status: "active",
            reference,
            startDate: serverTimestamp(),
            endDate: endDate.toISOString(),
            autoRenew: true,
          },
        });
      } catch (e) {
        console.warn("Failed to write subscription to Firestore:", e);
      }
    }
    try {
      updateUser({
        plan: plan.includes("pro") ? "pro" : "free",
        planExpiry: endDate.toISOString(),
      });
    } catch (e) {
      console.warn("Failed to update AuthContext:", e);
    }
    toast({ message: "Pro activated! Welcome to ExamPadi Pro", type: "success" });
  }

  async function initializePayment({ plan, userEmail, userId, userName }) {
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast({ message: "Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.", type: "error" });
      return;
    }

    // Load Paystack script
    try {
      await loadPaystack();
    } catch (err) {
      toast({ message: err.message, type: "error" });
      return;
    }

    if (typeof window.PaystackPop === "undefined") {
      toast({ message: "Payment system not loaded. Check your connection and try again.", type: "error" });
      return;
    }

    setLoading(true);
    setError(null);

    const reference = `EP-${userId}-${Date.now()}`;
    const amount = (PLANS[plan]?.price || 0) * 100;

    if (amount <= 0) {
      setLoading(false);
      toast({ message: "Invalid plan selected.", type: "error" });
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: paystackKey,
        email: userEmail,
        amount,
        ref: reference,
        currency: "NGN",
        metadata: { userId, plan, userName },
        callback: async function (response) {
          try {
            await verifyPayment(response.reference, plan, userId);
          } catch (e) {
            console.error("Payment verification error:", e);
            toast({ message: "Payment received but activation failed. Contact support.", type: "error" });
          } finally {
            setLoading(false);
          }
        },
        onClose: function () {
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error("Paystack setup error:", err);
      setLoading(false);
      toast({ message: "Failed to open payment. " + (err.message || "Try again."), type: "error" });
    }
  }

  return { initializePayment, verifyPayment, loading, error };
}
