import logger from "./logger.js";
import server from "./server.js";

// Handle all exceptions

process.on("uncaughtException", (e) => {
  logger.error(`::: Uncaught exception has been fired with error: ${e} :::`);
});

process.on("warning", (e) => {
  logger.warn(e);
});

process.on("unhandledRejection", (e) => {
  logger.error(
    `::: Unhandled rejection with error ${JSON.stringify(e)} [${e}] :::`,
  );
});

const port = process.env.PORT || 50000;

server.listen(port, () => {
  logger.info(`::: API Gateway is running on port [${port}] :::`);
  logger.info(
    `::: Auth service is running on [${process.env.AUTH_SERVICE_URL}] :::`,
  );
  logger.info(
    `::: Post service is running on [${process.env.POST_SERVICE_URL}] :::`,
  );
  logger.info(
    `::: Media service is running on [${process.env.MEDIA_SERVICE_URL}] :::`,
  );
  logger.info(
    `::: Search service is running on [${process.env.SEARCH_SERVICE_URL}] :::`,
  );
  logger.info(`::: Redis service is running on [${process.env.REDIS_URL}] :::`);
});
