import { Request, Response, NextFunction } from "express";

/**
 * Small fixed-window limiter for the endpoints anyone can call without logging
 * in (booking, looking up and cancelling by phone). It only has to stop a
 * script hammering the form, so it is kept in memory: a restart resets it,
 * which is fine.
 *
 * Limits are deliberately generous. Visitors coming through the Vercel or
 * Netlify front doors can share the platform's addresses, and a room full of
 * people at a demo must not lock each other out.
 */
export default function rateLimit(max: number, windowMs: number, message: string) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip ?? "unknown";
    const entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      // Drop stale keys now and then so the map cannot grow without bound.
      if (hits.size > 10_000) {
        for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
      }
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ message });
    }
    return next();
  };
}
