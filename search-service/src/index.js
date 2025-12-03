import logger from "./logger.js";
import server from "./server.js";
import { connectToRabbitMQ } from "./modules/rabbitmq.js";
import { initializeEventConsumers } from "./modules/events/eventConsumers.js";

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

(async () => {
  await connectToRabbitMQ();
  await initializeEventConsumers();

  const port = process.env.PORT || 90001;

  server.listen(port, () => {
    logger.info(`::: Search service running on port [${port}] :::`);
  });
})();
