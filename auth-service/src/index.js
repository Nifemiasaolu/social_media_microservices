import logger from "./logger.js";
import server from "./server.js";

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

const port = process.env.PORT || 50001;

server.listen(port, () => {
  logger.info(`::: Auth service running on port [${port}] :::`);
});
