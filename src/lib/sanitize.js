export function sanitizeInput(input, maxLength = 5000) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .slice(0, maxLength)
    .trim();
}

export function sanitizeObject(obj, maxLength = 5000) {
  if (!obj || typeof obj !== "object") return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeInput(value, maxLength);
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value, maxLength);
    } else {
      result[key] = value;
    }
  }
  return result;
}
