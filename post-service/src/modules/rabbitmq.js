import amqp from "amqplib";
import logger from "../logger.js";

let connection = null;
let channels = new Map();
const RETRY_PERIOD = 5000; // 5s
export const connectToRabbitMQ = async () => {
  if (connection) return connection;

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL);

    connection.on("close", () => {
      logger.error(`::: RabbitMQ connection closed. Reconnecting... :::`);
      connection = null;
      channels.clear();
      setTimeout(connectToRabbitMQ, RETRY_PERIOD);
    });

    logger.info(`::: Connected to RabbitMQ :::`);
    return connection;
  } catch (e) {
    logger.error(
      `::: Error connecting to RabbitMQ with response: ${JSON.stringify(e)} :::`,
    );
    throw e;
  }
};

/**
 * Create or get a durable channels for a given exchange.
 */
export const getChannels = async (exchangeName, type = "topic") => {
  if (channels.has(exchangeName)) {
    return channels.get(exchangeName);
  }

  const conn = await connectToRabbitMQ();
  const channel = await conn.createChannel();

  // Exchange durable(survives restart)
  await channel.assertExchange(exchangeName, type, { durable: true });
  channels.set(exchangeName, channel);

  logger.info(`::: Channel created for durable exchange [${exchangeName}] :::`);
  return channel;
};

export const deleteExchange = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.deleteExchange("facebook_events");
  console.log("Exchange deleted successfully");

  await channel.close();
  await connection.close();
};
