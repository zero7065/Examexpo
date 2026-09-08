import { useState } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { PLANS } from "../config/plans";
import { openPaystack } from "../paystack";
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
        console.warn("Failed to write subscription:", e);
      }
    }
    try {
      updateUser({
        plan: plan.includes("pro") ? "pro" : "free",
        planExpiry: endDate.toISOString(),
      });
    } catch (e) {
      console.warn("Failed to update user:", e);
    }
    toast({ message: "Pro activated! Welcome to ExamPadi Pro", type: "success" });
  }

  async function initializePayment({ plan, userEmail, userId, userName }) {
    const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast({ message: "Paystack key missing. Add VITE_PAYSTACK_PUBLIC_KEY to .env.", type: "error" });
      return;
    }

    const planData = PLANS[plan];
    if (!planData || planData.price <= 0) {
      toast({ message: "Invalid plan selected.", type: "error" });
      return;
    }

    setLoading(true);
    setError(null);

    const reference = `EP-${userId}-${Date.now()}`;
    const amount = planData.price * 100;

    try {
      await openPaystack({
        key: paystackKey,
        email: userEmail,
        amount: amount,
        ref: reference,
        currency: "NGN",
        metadata: { userId, plan, userName },
        onSuccess: async function(response) {
          try {
            await verifyPayment(response.reference, plan, userId);
          } catch (e) {
            console.error("Verify error:", e);
            toast({ message: "Payment received but activation failed. Contact support.", type: "error" });
          } finally {
            setLoading(false);
          }
        },
        onClose: function() {
          setLoading(false);
        },
      });
    } catch (err) {
      setLoading(false);
      const msg = err.message || "Payment failed. Try again.";
      if (msg !== "Payment cancelled") {
        toast({ message: msg, type: "error" });
      }
    }
  }

  return { initializePayment, verifyPayment, loading, error };
}
