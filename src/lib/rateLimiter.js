const buckets = new Map();

export function checkRateLimit(key, maxPerMinute = 10) {
  const now = Date.now();
  const windowStart = now - 60000;
  const timestamps = (buckets.get(key) || []).filter((t) => t > windowStart);
  if (timestamps.length >= maxPerMinute) {
    return { allowed: false, retryAfter: Math.ceil((60000 - (now - timestamps[0])) / 1000) };
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  return { allowed: true };
}

export function resetRateLimit(key) {
  buckets.delete(key);
}
