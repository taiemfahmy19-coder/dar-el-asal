/**
 * Tiny sliding-window rate limiter (per-instance, per-IP) for POST /api/orders.
 * The login route keeps its own dedicated limiter with stricter locks.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface OrderRateVerdict {
  allowed: boolean;
  retryAfterSeconds?: number;
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 8;          // generous for a real store; blocks spam bursts

export function consumeOrderRateLimit(ip: string, now = Date.now()): OrderRateVerdict {
  if (!ip) return { allowed: true }; // no IP context (tests) → allow, prod always has one

  const bucket = buckets.get(ip);
  const fresh = bucket ? bucket.timestamps.filter((t) => now - t < WINDOW_MS) : [];
  if (fresh.length >= MAX_ATTEMPTS) {
    const oldest = fresh[0];
    return { allowed: false, retryAfterSeconds: Math.ceil((WINDOW_MS - (now - oldest)) / 1000) };
  }
  fresh.push(now);
  buckets.set(ip, { timestamps: fresh });
  return { allowed: true };
}
