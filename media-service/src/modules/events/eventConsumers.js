import logger from "../../logger.js";
import { consumeEvent } from "./events.js";
import { handleMediaDeletion } from "../../media/media.service.js";
import { DELETED_POST } from "./event.keys.js";
import { FACEBOOK_EVENT } from "./event-names.js";

const EVENT_HANDLERS = [
  {
    exchangeName: FACEBOOK_EVENT,
    routingKey: DELETED_POST,
    handler: async (data) => {
      logger.info(
        `::: Received [${DELETED_POST}] data: [${JSON.stringify(data)}]  :::`,
      );
      const { postId, mediaIds, userId } = data;

      await handleMediaDeletion({ postId, mediaIds, userId });
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
