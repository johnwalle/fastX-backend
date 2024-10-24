const httpStatus = require("http-status");
const ApiError = require("../utils/apiError");
const catchAsync = require("../utils/catchAsync");
const { RateLimiterMongo } = require('rate-limiter-flexible');
const mongoose = require("mongoose");
const config = require('../config/config');

// Define rate limiter options
const rateLimiterOptions = {
    storeClient: mongoose.connection,
    blockDuration: 60 * 60 * 24,
    dbName: 'eCommerce',
};

// Create rate limiters
const emailIpBruteLimiter = new RateLimiterMongo({
    ...rateLimiterOptions,
    points: config.rateLimiter.maxAttemptsByIpUsername,
    duration: 60 * 10, // 10 minutes
});

const slowerBruteLimiter = new RateLimiterMongo({
    ...rateLimiterOptions,
    points: config.rateLimiter.maxAttemptsPerDay,
    duration: 60 * 60 * 24, // 24 hours
});

const emailBruteLimiter = new RateLimiterMongo({
    ...rateLimiterOptions,
    points: config.rateLimiter.maxAttemptsPerEmail,
    duration: 60 * 60 * 24, // 24 hours
});

// Middleware to apply rate limits
const authLimiter = catchAsync(async (req, res, next) => {
    const ipaddr = req.connection.remoteAddress;
    const emailIpKey = `${req.body.email}_${ipaddr}`;

    try {
        // Fetch rate limiter results
        const [slowerBruteRes, emailIpRes, emailBruteRes] = await Promise.all([
            slowerBruteLimiter.get(ipaddr),
            emailIpBruteLimiter.get(emailIpKey),
            emailBruteLimiter.get(req.body.email),
        ]);

        let retrySeconds = 0;
        let errorMessage = 'Too many requests';

        // Check rate limiter results and calculate retry time
        if (slowerBruteRes && slowerBruteRes.consumedPoints >= config.rateLimiter.maxAttemptsPerDay) {
            retrySeconds = Math.floor(slowerBruteRes.msBeforeNext / 1000) || 1;
            errorMessage = `Too many requests from IP address. Try again in ${retrySeconds} seconds.`;
        } else if (emailIpRes && emailIpRes.consumedPoints >= config.rateLimiter.maxAttemptsByIpUsername) {
            retrySeconds = Math.floor(emailIpRes.msBeforeNext / 1000) || 1;
            errorMessage = `Too many requests for this email and IP address combination. Try again in ${retrySeconds} seconds.`;
        } else if (emailBruteRes && emailBruteRes.consumedPoints >= config.rateLimiter.maxAttemptsPerEmail) {
            retrySeconds = Math.floor(emailBruteRes.msBeforeNext / 1000) || 1;
            errorMessage = `Too many requests for this email. Try again in ${retrySeconds} seconds.`;
        }

        // If retry time is greater than 0, send Too Many Requests error
        if (retrySeconds > 0) {
            res.set('Retry-After', String(retrySeconds));
            return next(new ApiError(httpStatus.TOO_MANY_REQUESTS, errorMessage));
        }

        next();
    } catch (error) {
        // Handle any errors and log them
        console.error('Error in auth limiter:', error);
        next(error);
    }
});

module.exports = {
    emailIpBruteLimiter,
    slowerBruteLimiter,
    emailBruteLimiter,
    authLimiter,
};
