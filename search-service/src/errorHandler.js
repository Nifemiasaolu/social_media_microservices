import logger from "./logger.js";
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "./modules/status.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.message || "Unknown error");
  if (err.stack) {
    logger.error(`::: Error handled with response: ${err.stack} :::`);
  }

  const statusCode = err.status || err.statusCode || INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    status: false,
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
