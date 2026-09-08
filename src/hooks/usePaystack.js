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

    // Write subscription to Firestore FIRST so useSubscription re-fetch sees it
    if (db && userId) {
      try {
        await updateDoc(doc(db, "users", userId), {
          subscription: {
            plan,
            status: "active",
            reference,
            startDate: serverTimestamp(),
            endDate,
            autoRenew: true,
          },
        });
      } catch (e) {
        console.warn("Failed to write subscription to Firestore:", e);
      }
    }

    // Then update AuthContext so isPro() and UI reflect Pro status
    updateUser({
      plan: plan.includes("pro") ? "pro" : "free",
      planExpiry: endDate.toISOString(),
    });

    toast({ message: "Pro activated! Welcome to ExamPadi Pro", type: "success" });
  }

  async function initializePayment({ plan, userEmail, userId, userName }) {
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast({ message: "Paystack public key is missing. Add VITE_PAYSTACK_PUBLIC_KEY to your .env file.", type: "error" });
      return;
    }

    // Load Paystack script if not already loaded
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
    const amount = PLANS[plan].price * 100;

    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email: userEmail,
      amount,
      ref: reference,
      currency: "NGN",
      metadata: { userId, plan, userName },
      callback: async function (response) {
        await verifyPayment(response.reference, plan, userId);
        setLoading(false);
      },
      onClose: function () {
        console.log("Payment popup closed by user");
        setLoading(false);
      },
    });

    handler.openIframe();
  }

  return { initializePayment, verifyPayment, loading, error };
}
