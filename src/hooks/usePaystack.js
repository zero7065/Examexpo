import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { PLANS } from "../config/plans";
import { doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export function usePaystack() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateEndDate = useCallback((plan) => {
    const now = new Date();
    if (plan === "pro_monthly") return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (plan === "pro_yearly") return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    return now;
  }, []);

  const verifyPayment = useCallback(async (reference, plan, userId) => {
    if (!db || !userId) return false;

    try {
      // Save payment record
      await setDoc(doc(db, "payments", reference), {
        userId,
        reference,
        plan,
        amount: PLANS[plan]?.price || 0,
        status: "pending_verification",
        createdAt: serverTimestamp(),
        paystackReference: reference,
      });

      // Update user subscription
      const endDate = calculateEndDate(plan);
      await updateDoc(doc(db, "users", userId), {
        subscription: {
          plan: plan,
          status: "active",
          reference: reference,
          startDate: serverTimestamp(),
          endDate: endDate,
          autoRenew: true,
        },
      });

      // TODO: Replace with Firebase Cloud Function webhook verification before production
      // This is an optimistic update — in production, a Paystack webhook
      // hitting a Cloud Function should verify the transaction server-side.

      if (refreshProfile) await refreshProfile();
      return true;
    } catch (e) {
      console.error("Payment verification save failed:", e);
      return false;
    }
  }, [calculateEndDate, refreshProfile]);

  const initializePayment = useCallback(async ({ plan, userEmail, userId, userName }) => {
    setLoading(true);
    setError(null);

    try {
      const PaystackPop = (await import("@paystack/inline-js")).default;
      if (!PaystackPop) throw new Error("Failed to load Paystack");

      const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!paystackKey) throw new Error("Paystack public key not configured");

      const reference = `EP-${userId}-${Date.now()}`;

      const handler = PaystackPop.setup({
        key: paystackKey,
        email: userEmail,
        amount: PLANS[plan].price * 100,
        currency: "NGN",
        ref: reference,
        metadata: {
          userId,
          plan,
          userName,
        },
        callback: async (response) => {
          const success = await verifyPayment(response.reference, plan, userId);
          if (success) {
            toast({ message: "🎉 Pro activated! Welcome to ExamPadi Pro", type: "success" });
          } else {
            toast({ message: "Payment recorded but verification pending.", type: "info" });
          }
          setLoading(false);
        },
        onClose: () => {
          console.log("Payment cancelled by user");
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (e) {
      console.error("Paystack init error:", e);
      setError(e.message);
      setLoading(false);
    }
  }, [verifyPayment, toast]);

  return { initializePayment, verifyPayment, loading, error };
}