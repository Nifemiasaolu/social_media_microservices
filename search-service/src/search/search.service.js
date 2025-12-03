import Joi from "joi";
import { BadRequestError } from "../modules/app-error.js";
import logger from "../logger.js";
import { CREATED, OK } from "../modules/status.js";
import Search from "./search.model.js";

export const handlePostCreation = async (params) => {
  try {
    const schema = Joi.object().keys({
      userId: Joi.string().required(),
      postId: Joi.string().required(),
      content: Joi.string().required(),
      createdAt: Joi.date().required(),
    });

    const validateSchema = schema.validate(params);
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }
    const { userId, postId, content, createdAt } = params;

    const createdPost = await Search.create({
      userId,
      postId,
      content,
      createdAt,
    });

    logger.info(
      `::: Post successfully created in Search service: [${JSON.stringify(createdPost)}] :::`,
    );

    return Promise.resolve({
      statusCode: CREATED,
      data: "Search post created successfully",
    });
  } catch (e) {
    logger.error(`::: Failed to create post with error: ${e}`);
    throw new BadRequestError(e.message || "Failed to create post");
  }
};

export const searchPost = async ({ userId, query }) => {
  try {
    const existingUser = await Search.findOne({ userId });
    if (!existingUser) {
      throw new BadRequestError("User not found");
    }

    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: textScore } },
    )
      .sort({ score: { $meta: textScore } })
      .limit(10);

    return Promise.resolve({
      statusCode: OK,
      data: results,
    });
  } catch (e) {
    logger.error(`::: Failed to search post with error response: ${e} ::: `);
    throw new BadRequestError(e.message || "Failed to search post");
  }
};
