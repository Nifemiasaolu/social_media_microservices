import { redisClient } from "./redis.js";
import logger from "../logger.js";

function CacheService() {
  this.redisClient = redisClient;
}

CacheService.prototype.get = ({ key }) => {
  if (!key) {
    throw new Error("Get Redis Key should be defined");
  }
  return redisClient.get(key);
};

CacheService.prototype.set = ({ key, value, expiration }) => {
  if (!(key && value)) {
    throw new Error(`Both key ${key} and value ${value} should be defined`);
  }

  if (expiration) {
    return redisClient.set(key, value, "EX", expiration);
  }
  return redisClient.set(key, value);
};

CacheService.prototype.delete = ({ key }) => {
  if (!key) {
    throw new Error("Delete Redis key should be defined");
  }

  return redisClient.del(key);
};

CacheService.prototype.deletePattern = async (pattern, userId = "NA") => {
  const keys = await redisClient.keys(pattern);

  if (keys.length > 0) {
    await redisClient.del(keys);
    logger.info(
      `::: Cleared [${keys.length}] cached pages for user [${userId}] :::`,
    );
  }
};

export default new CacheService();
