import { getChannels } from "../rabbitmq.js";
import logger from "../../logger.js";

export const publishEvent = async (exchangeName, routingKey, message) => {
  const channel = await getChannels(exchangeName);

  const sent = await channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(JSON.stringify(message)),
  );

  if (sent) {
    logger.info(
      `::: Event published to [${exchangeName}] with key [${routingKey}] :::`,
    );
  } else {
    logger.error(
      `::: Failed to publish message [${exchangeName}] with key [${routingKey}] :::`,
    );
  }
};

export const consumeEvent = async (exchangeName, routingKey, cb) => {
  const channel = await getChannels(exchangeName);

  const queue = `${exchangeName}_${routingKey}`;
  const q = await channel.assertQueue(queue, { exclusive: false });
  await channel.bindQueue(q.queue, exchangeName, routingKey);

  channel.consume(
    q.queue,
    (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString());
          cb(content);
          channel.ack(msg);
        } catch (e) {
          logger.error(
            `::: Error processing message [${msg.content.toString()}]: ${e.message} :::`,
          );
          channel.nack(msg, false, true);
        }
      }
    },
    { noAck: false },
  );

  logger.info(
    `::: Consumer subscribed to event [${exchangeName}] with key [${routingKey}] :::`,
  );
};
