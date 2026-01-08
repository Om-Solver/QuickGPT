import rateLimit from 'express-rate-limit';

// Disable rate limiting by default - enable only in production
const RATE_LIMIT_ENABLED = process.env.ENABLE_RATE_LIMIT === 'true';

// Helper to get user identifier (use user ID if authenticated, else IP)
const getUserIdentifier = (req) => req.user?._id?.toString() || req.ip;

// No-op rate limiter that does nothing
const noOpLimiter = (req, res, next) => next();

// API rate limiter
export const apiLimiter = RATE_LIMIT_ENABLED 
  ? rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => getUserIdentifier(req),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter: req.rateLimit.resetTime
        });
    }
})
  : noOpLimiter;

// Gemini API rate limiter
export const geminiLimiter = RATE_LIMIT_ENABLED 
  ? rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
    message: 'Too many API requests. Please wait before trying again.',
    keyGenerator: (req) => getUserIdentifier(req),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'API rate limit exceeded. Please wait before trying again.',
            retryAfter: req.rateLimit.resetTime
        });
    }
})
  : noOpLimiter;

// ImageKit rate limiter
export const imagekitLimiter = RATE_LIMIT_ENABLED 
  ? rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    skipFailedRequests: true,
    keyGenerator: (req) => getUserIdentifier(req),
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Image generation rate limit exceeded. Please try again later.',
            retryAfter: req.rateLimit.resetTime
        });
    }
})
  : noOpLimiter;

export default {
    apiLimiter,
    geminiLimiter,
    imagekitLimiter
};;
