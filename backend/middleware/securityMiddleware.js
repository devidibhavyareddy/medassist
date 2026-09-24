import helmet from "helmet";
import rateLimit from "express-rate-limit";


// Security headers
export const securityHeaders = helmet();


// General API rate limiter
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});


// Login rate limiter
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});