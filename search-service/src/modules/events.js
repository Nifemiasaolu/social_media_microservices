import connectToRabbitMQ, { EXCHANGE_NAME } from "./rabbitmq.js";
import logger from "../logger.js";

let channel = null;

export const publishEvent = async (routingKey, message) => {
  if (!channel) {
    channel = await connectToRabbitMQ();
  }
  await channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message)),
  );
  logger.info(`::: Event published: [${routingKey}] :::`);
};
