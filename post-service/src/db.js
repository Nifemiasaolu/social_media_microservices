import mongoose from "mongoose";
import logger from "./logger.js";

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("::: Database connected successfully :::");
  } catch (e) {
    logger.error(`::: Failed to connect to mongodb with error: ${e} :::`);
    throw e;
  }
};

export default connect;
