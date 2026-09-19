// Minimal in-memory fixed-window rate limiter.
//
// This is intentionally simple: no Redis, no external package. It is scoped
// to a single Node process, which is the current deployment shape (one
// backend instance). If this app is ever scaled horizontally behind a load
// balancer, this in-memory counter must move to a shared store (e.g. Redis)
// since each instance would otherwise track its own separate counts.
//
// Used to blunt brute-force login/registration attempts (audit section:
// "Login security" / "rate limiting"), not as a general-purpose API gateway
// feature.

const buckets = new Map();

export const rateLimit = ({ windowMs, max, message }) => {
  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message: message || "Too many requests. Please try again later.",
      });
    }
    next();
  };
};

// Periodically drop expired buckets so this Map doesn't grow unbounded.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref();
