// src/paystack.js
let paystackLoaded = false;
let loadPromise = null;

export const PLANS = {
  free: {
    id: "free",
    name: "Basic Plan",
    price: 0,
    displayPrice: "₦0",
    duration: 365,
    features: ["30 Questions Daily", "Basic Explanations", "Standard Subjects", "No Study Plan"]
  },
  proMonthly: {
    id: "proMonthly",
    name: "Pro Monthly",
    price: 3000 * 100, // Paystack uses kobo
    displayPrice: "₦3,000",
    duration: 30,
    badge: "Most Popular",
    features: ["Unlimited Questions", "Advanced AI Tutor", "CBT Simulation Mode", "Personalized Study Plan", "Weak Topic Analysis"]
  },
  proYearly: {
    id: "proYearly",
    name: "Pro Yearly",
    price: 10000 * 100, // Paystack uses kobo
    displayPrice: "₦10,000",
    duration: 365,
    savings: "Save ₦8,000",
    badge: "Best Value",
    features: ["Unlimited Questions", "Advanced AI Tutor", "CBT Simulation Mode", "Personalized Study Plan", "Weak Topic Analysis", "Priority Access to New Features"]
  }
};

export function loadPaystack() {
  if (paystackLoaded && window.PaystackPop) return Promise.resolve(window.PaystackPop);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      reject(new Error("Paystack script took too long to load. Check your internet connection."));
    }, 10000);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      clearTimeout(timeout);
      paystackLoaded = true;
      resolve(window.PaystackPop);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      loadPromise = null;
      reject(new Error("Failed to load Paystack. Check your internet connection."));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export async function initiatePayment({ email, plan, userUid, userName, onSuccess, onClose, onError }) {
  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  
  if (!paystackKey) {
    if (onError) onError(new Error("Paystack not configured. Add VITE_PAYSTACK_PUBLIC_KEY to environment variables."));
    return;
  }

  try {
    const PaystackPop = await loadPaystack();

    // Keep handler in a ref so it's not garbage collected
    const handler = PaystackPop.setup({
      key: paystackKey,
      email,
      amount: plan.price,
      currency: "NGN",
      ref: `EXAMPADI-${userUid}-${Date.now()}`,
      firstname: userName?.split(" ")[0] || "",
      lastname: userName?.split(" ")[1] || "",
      metadata: {
        userId: userUid,
        plan: plan.id,
        duration: plan.duration,
        custom_fields: [
          { display_name: "User UID", variable_name: "user_uid", value: userUid },
          { display_name: "Plan", variable_name: "plan_id", value: plan.id },
          { display_name: "Duration (days)", variable_name: "duration", value: String(plan.duration) },
        ],
      },
      callback: (response) => {
        console.log("Paystack success:", response.reference);
        if(onSuccess) onSuccess(response);
      },
      onClose: () => {
        console.log("Paystack modal closed");
        if(onClose) onClose();
      },
    });

    handler.openIframe();
  } catch (err) {
    console.error("Paystack error:", err.message);
    if (onError) onError(err);
  }
}
