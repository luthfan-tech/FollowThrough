/**
 * FollowThrough Request Rate Limiter & Concurrency Throttler
 *
 * Implements an in-memory Sliding Window Rate Limiter and an
 * Asynchronous Concurrency Semaphore to protect LLM endpoints and
 * prevent server overload.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000);
      if (record.timestamps.length === 0) {
        rateLimitStore.delete(key);
      }
    });
  }, 300000);
}

/**
 * Checks if a client exceeds their rate limit.
 * @param identifier Client IP or user ID
 * @param limit Maximum requests allowed in window
 * @param windowMs Time window in milliseconds (default: 60,000ms / 1 min)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(identifier, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetMs: windowMs,
  };
}

/**
 * Asynchronous Concurrency Semaphore
 * Limits the number of simultaneous heavy AI agent pipeline runs
 */
class ConcurrencySemaphore {
  private activeCount = 0;
  private readonly maxConcurrent: number;

  constructor(maxConcurrent: number = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  public canAcquire(): boolean {
    return this.activeCount < this.maxConcurrent;
  }

  public async acquire(): Promise<() => void> {
    while (this.activeCount >= this.maxConcurrent) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    this.activeCount++;
    let released = false;

    return () => {
      if (!released) {
        released = true;
        this.activeCount = Math.max(0, this.activeCount - 1);
      }
    };
  }

  public getActiveCount(): number {
    return this.activeCount;
  }
}

export const agentPipelineSemaphore = new ConcurrencySemaphore(3);
