import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";

let ratelimit: Ratelimit | null | undefined;

/**
 * Credentials sign-in rate limit (optional). Returns null when Upstash env is unset.
 */
export function getCredentialsRatelimit(): Ratelimit | null {
  if (ratelimit !== undefined) return ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    ratelimit = null;
    return null;
  }
  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(20, "1 m"),
    prefix: "bluffclub:auth:credentials",
  });
  return ratelimit;
}

export function isCredentialsLoginPost(pathname: string, method: string): boolean {
  if (method !== "POST") return false;
  return pathname.endsWith("/callback/credentials");
}
