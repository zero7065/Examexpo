// src/lib/vision.js — client-side image preprocessing for Groq vision calls.
// qwen/qwen3.8-27b accepts max 3 images/request, 2048 tokens each. We send at
// most ONE image per message, downscaled to keep latency low on 3G.

export const VISION_MODEL = "qwen/qwen3.8-27b";
const MAX_DIM = 1024;
const QUALITY = 0.7;

// Resize to max 1024px, JPEG 0.7 → base64 data URL. Rejects non-images.
export function preprocessImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file"));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      } catch (e) {
        reject(new Error("Could not process image"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image file"));
    };
    img.src = url;
  });
}

// Produce a smaller fallback (512px) for the downscaled retry.
export function downscaleDataUrl(dataUrl, maxDim = 512) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", QUALITY));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Could not downscale image"));
    img.src = dataUrl;
  });
}
