import { useState } from "react";
import { doc, setDoc, updateDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebase";
import { PLANS } from "../config/plans";
import { useToast } from "../components/Toast";

export function usePaystack() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

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
    try {
      const endDate = calculateEndDate(plan);
      const paymentRef = doc(collection(db, "payments"), reference);
      await setDoc(paymentRef, {
        userId,
        reference,
        plan,
        amount: PLANS[plan].price,
        status: "pending_verification",
        createdAt: serverTimestamp(),
        paystackReference: reference,
      });
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
      toast({ message: "🎉 Pro activated! Welcome to ExamPadi Pro", type: "success" });
    } catch (err) {
      console.error("verifyPayment error:", err);
      toast({ message: "Payment recorded but profile update failed. Contact support.", type: "error" });
    }
  }

  function initializePayment({ plan, userEmail, userId, userName }) {
    if (typeof window.PaystackPop === "undefined") {
      toast({ message: "Payment system not loaded. Check your connection.", type: "error" });
      return;
    }

    setLoading(true);
    setError(null);

    const reference = `EP-${userId}-${Date.now()}`;
    const amount = PLANS[plan].price * 100;

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
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