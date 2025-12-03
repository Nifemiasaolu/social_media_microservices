import Joi from "joi";
import logger from "../logger.js";
import { BadRequestError, NotFoundError } from "../modules/app-error.js";
import Post from "./post.model.js";
import { CREATED, OK } from "../modules/status.js";
import cacheService from "../modules/cache-service.js";
import { publishEvent } from "../modules/events/events.js";
import { CREATED_POST, DELETED_POST } from "../modules/events/event.keys.js";
import { FACEBOOK_EVENT } from "../modules/events/event-names.js";

const EXPIRES_IN_SECS = 180; // --> 3 minutes
const EXPIRES_IN_30_MINUTES = 1800; // --> 30 minutes

const getPostPattern = (userId) => `post:${userId}:*`;

export const createPost = async ({ userId, params }) => {
  try {
    if (!params) {
      throw new BadRequestError("Request body is required.");
    }

    const schema = Joi.object().keys({
      content: Joi.string().required(),
      mediaIds: Joi.array().items(Joi.string().optional()).optional(),
    });

    const validateSchema = schema.validate(params);
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }

    const { content, mediaIds } = params;
    const createdPost = new Post({
      userId,
      content,
      mediaIds: mediaIds || [],
    });

    // Invalidate all cached post pages for this user and Publish Event
    const pattern = getPostPattern(userId);

    await Promise.allSettled([
      createdPost.save(),
      cacheService.deletePattern(pattern, userId),
      publishEvent(FACEBOOK_EVENT, CREATED_POST, {
        postId: createdPost.id,
        userId,
        content: createdPost.content,
        createdAt: createdPost.createdAt,
      }),
    ]);

    logger.info(`::: Post created successfully: [${createdPost.id}] :::`);
    return Promise.resolve({
      statusCode: CREATED,
      data: "Post created successfully.",
    });
  } catch (e) {
    logger.error(`::: Failed to create post with error: ${e}`);
    throw new BadRequestError(e.message || "Failed to create post");
  }
};

export const getAllPosts = async ({ userId, query }) => {
  const schema = Joi.object().keys({
    page: Joi.number().integer(),
    size: Joi.number().integer(),
  });

  const validateSchema = schema.validate(query);
  if (validateSchema.error) {
    throw new BadRequestError(validateSchema.error.details[0].message);
  }

  try {
    const modifiedQuery = {
      userId,
    };

    const options = {
      page: parseInt(query.page || 1, 10),
      limit: parseInt(query.size || 10, 10),
      sort: { createdAt: -1 },
    };

    const cacheKey = `post:${userId}:${options.page}:${options.limit}`;
    const cached = await cacheService.get({ key: cacheKey });

    if (cached) {
      const cachedData = JSON.parse(cached);
      return {
        statusCode: OK,
        data: cachedData,
      };
    }

    const postLists = await Post.paginate(modifiedQuery, options);

    const data = {
      page: postLists.page,
      size: postLists.limit,
      total: postLists.totalDocs,
      list: postLists.docs,
    };

    await cacheService.set({
      key: cacheKey,
      value: JSON.stringify(data),
      expiration: EXPIRES_IN_SECS,
    });

    logger.info(`::: Successfully fetched all posts :::`);

    return Promise.resolve({
      statusCode: OK,
      data,
    });
  } catch (e) {
    logger.error(`::: Failed to fetch all posts with error: ${e}`);
    throw new BadRequestError(e.message || "Failed to fetch all posts");
  }
};

export const getPost = async ({ userId, id }) => {
  if (!id) {
    throw new BadRequestError("Id for post is required.");
  }

  const schema = Joi.object().keys({
    id: Joi.string().required(),
  });

  const validateSchema = schema.validate({ id });
  if (validateSchema.error) {
    throw new BadRequestError(validateSchema.error.details[0].message);
  }

  try {
    const cacheKey = `post:${userId}:${id}`;
    const cached = await cacheService.get({ key: cacheKey });

    if (cached) {
      const cachedData = JSON.parse(cached);
      return {
        statusCode: OK,
        data: cachedData,
      };
    }

    const singlePost = await Post.findById(id).lean();

    if (!singlePost) {
      logger.error(`::: Post not found for id [${id}] :::`);
      throw new NotFoundError("Post not found");
    }

    await cacheService.set({
      key: cacheKey,
      value: JSON.stringify(singlePost),
      expiration: EXPIRES_IN_30_MINUTES,
    });

    return Promise.resolve({
      statusCode: OK,
      data: singlePost,
    });
  } catch (e) {
    logger.error(`::: Failed to fetch post with error: ${e}`);
    throw new BadRequestError(e.message || "Failed to fetch post");
  }
};

export const deletePost = async ({ id, userId }) => {
  try {
    const cacheKey = `post:${userId}:${id}`;
    const pattern = getPostPattern(userId);

    const post = await Post.findOneAndDelete({ _id: id, userId });
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    // Invalidate all cached post pages for this user && Publish Event.
    await Promise.allSettled([
      cacheService.delete({ key: cacheKey }),
      cacheService.deletePattern(pattern, userId),
      publishEvent(FACEBOOK_EVENT, DELETED_POST, {
        postId: post.id.toString(),
        mediaIds: post.mediaIds,
        userId,
      }),
    ]);

    logger.info(`::: Post with id [${id}] successfully deleted :::`);
    return Promise.resolve({
      statusCode: OK,
      data: "Post deleted successfully",
    });
  } catch (e) {
    logger.error(`::: Failed to delete post with error: ${e}`);
    throw new BadRequestError(e.message || "Failed to delete post");
  }
};
