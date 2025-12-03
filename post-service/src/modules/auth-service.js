import logger from "../logger.js";
import { UN_AUTHORISED } from "./status.js";
import { redisClient } from "./redis.js";

export const authenticateUser = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    logger.error(`::: Attempted access without authorization :::`);
    return res.status(UN_AUTHORISED).json({
      status: false,
      message: "Authentication required! Please login to continue.",
    });
  }
  req.user = { userId };
  next();
};
