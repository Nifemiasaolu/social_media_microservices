import { RateLimiterRedis } from "rate-limiter-flexible";
import { redisClient } from "./redis.js";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "../logger.js";
import { EXCESS_REQUEST } from "./status.js";

//DDos protection and rate limiter
const rateLimiterPayload = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 3,
});

export const rateLimiter = (req, res, next) => {
  rateLimiterPayload
    .consume(req.ip)
    .then(() => next())
    .catch((e) => {
      logger.error(`::: Rate limit exceeded for IP: [${req.ip}] :::`);
      return res.status(EXCESS_REQUEST).json({
        status: false,
        message: e.message || "Too many request made.",
      });
    });
};

// Ip based rate limit for sensitive endpoints
export const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(
      `::: Sensitive endpoint rate limit exceeded for IP [${req.ip}] :::`,
    );
    return res.status(EXCESS_REQUEST).json({
      status: false,
      message: "Too many requests.",
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});
