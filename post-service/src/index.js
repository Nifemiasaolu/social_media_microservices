import logger from "./logger.js";
import server from "./server.js";
import { connectToRabbitMQ, deleteExchange } from "./modules/rabbitmq.js";

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
deleteExchange();

connectToRabbitMQ()
  .then(() => {})
  .catch(() => {});

const port = process.env.PORT || 50003;

server.listen(port, () => {
  logger.info(`::: Post service running on port [${port}] :::`);
});
