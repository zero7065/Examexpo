// src/paystack.js
let paystackLoaded = false;
let loadPromise = null;

export function loadPaystack() {
  if (paystackLoaded && window.PaystackPop) return Promise.resolve(window.PaystackPop);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If script already exists in DOM but hasn't loaded yet
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      // Wait for it
      const check = setInterval(() => {
        if (window.PaystackPop) {
          clearInterval(check);
          clearTimeout(timeout);
          paystackLoaded = true;
          resolve(window.PaystackPop);
        }
      }, 100);
      const timeout = setTimeout(() => {
        clearInterval(check);
        loadPromise = null;
        reject(new Error("Paystack script took too long to load. Check your connection."));
      }, 10000);
      return;
    }

    const timeout = setTimeout(() => {
      loadPromise = null;
      reject(new Error("Paystack script took too long to load. Check your internet connection."));
    }, 10000);

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => {
      clearTimeout(timeout);
      paystackLoaded = true;
      loadPromise = null;
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
