import { UN_AUTHORISED } from "./modules/status.js";
import logger from "./logger.js";
import jwt from "jsonwebtoken";

export const validateToken = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    logger.error(`::: No valid token is provided :::`);
    return res.status(UN_AUTHORISED).json({
      status: false,
      message: "Authentication token is required",
    });
  }

  const token = bearerToken.split(" ")[1];
  if (!token) {
    return res.status(UN_AUTHORISED).json({
      status: false,
      message: "Session expired. Please login with your valid credentials.",
    });
  }

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      logger.error(`::: Invalid token with error [${err}] :::`);
      return res.status(UN_AUTHORISED).json({
        status: false,
        message: "Invalid token! Kindly login to continue.",
      });
    }
    console.log(`==== Logged in user: ${JSON.stringify(user)} ===`);
    req.user = user;
    console.log(`=== Authorized req.user: ${JSON.stringify(req.user)} ====`);
    next();
  });
};
