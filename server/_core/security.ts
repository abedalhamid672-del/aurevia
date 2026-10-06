import type { NextFunction, Request, RequestHandler, Response } from "express";

type Bucket = { startedAt: number; count: number };

export function securityHeaders(): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  };
}

export function createRateLimiter({ windowMs, max, name }: { windowMs: number; max: number; name: string }): RequestHandler {
  const buckets = new Map<string, Bucket>();
  let lastCleanup = Date.now();
  return (req, res, next) => {
    const now = Date.now();
    if (now - lastCleanup > windowMs) {
      buckets.forEach((bucket, key) => {
        if (now - bucket.startedAt > windowMs) buckets.delete(key);
      });
      lastCleanup = now;
    }
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const bucket = buckets.get(key);
    const current = !bucket || now - bucket.startedAt > windowMs ? { startedAt: now, count: 0 } : bucket;
    current.count += 1;
    buckets.set(key, current);
    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, max - current.count)));
    if (current.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((windowMs - (now - current.startedAt)) / 1000)));
      res.status(429).json({ error: `${name} rate limit exceeded` });
      return;
    }
    next();
  };
}
