import logger from "../../logger.js";
import { consumeEvent } from "./events.js";
import { CREATED_POST } from "./event.keys.js";
import { FACEBOOK_EVENT } from "./event-names.js";
import { handlePostCreation } from "../../search/search.service.js";

const EVENT_HANDLERS = [
  {
    exchangeName: FACEBOOK_EVENT,
    routingKey: CREATED_POST,
    handler: async (data) => {
      logger.info(
        `::: Received [${CREATED_POST}] data: [${JSON.stringify(data)}]  :::`,
      );

      await handlePostCreation(data);
    },
  },
];

export const initializeEventConsumers = async () => {
  for (const { exchangeName, routingKey, handler } of EVENT_HANDLERS) {
    try {
      await consumeEvent(exchangeName, routingKey, handler);
      logger.info(`::: Subscribed to [${exchangeName}] -> [${routingKey}] :::`);
    } catch (e) {
      logger.error(
        `::: Failed to subscribe to [${exchangeName}] -> [${routingKey}] ::: ${e.message}`,
      );
    }
  }
};
