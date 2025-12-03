import { BadRequestError, NotFoundError } from "../modules/app-error.js";
import Joi from "joi";
import mongoose from "mongoose";
import User from "./user.model.js";
import { generateToken, verifyToken } from "../auth/auth.service.js";
import { CREATED, OK } from "../modules/status.js";
import logger from "../logger.js";
import { generateAlphaNumericValue } from "../modules/util.js";

const userPayload = (createdUser) => {
  return {
    userId: createdUser.userId,
    username: createdUser.username,
    email: createdUser.email,
    role: createdUser.role,
  };
};

export const registerUser = async ({ params }) => {
  try {
    if (!params) {
      throw new BadRequestError("Request body is required.");
    }

    const schema = Joi.object().keys({
      username: Joi.string().min(6).max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().optional(),
    });

    const validateSchema = schema.validate(params);
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }

    const { username, email } = params;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      existingUser.email === email
        ? logger.error(`::: User with email [${email}] already exists :::`)
        : logger.error(
            `::: User with username [${username}] already exists :::`,
          );
      throw new BadRequestError("User already exists.");
    }

    params.userId = `7${generateAlphaNumericValue(23)}`;
    const createdUser = await User.create(params);
    logger.info(
      `::: User with email [${email}] and username [${username}] created successfully :::`,
    );

    const [accessToken, refreshToken] = await Promise.all([
      generateToken(userPayload(createdUser), "access"),
      generateToken(userPayload(createdUser), "refresh"),
    ]);

    return Promise.resolve({
      statusCode: CREATED,
      data: {
        userId: createdUser.userId,
        username: createdUser.username,
        email: createdUser.email,
        role: createdUser.role,
        accessToken,
        refreshToken,
      },
    });
  } catch (e) {
    logger.error(`::: Failed to signup user with error: [${e}] :::`);
    throw new BadRequestError(e.message || "Failed to signup user");
  }
};
// TODO: USER LOGIN

export const loginUser = async ({ params }) => {
  try {
    if (!params) {
      throw new BadRequestError("Request body is required");
    }

    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const validateSchema = schema.validate(params);
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }

    const { email, password } = params;
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser || !(await existingUser.comparePassword(password))) {
      throw new BadRequestError("Invalid credentials. Please try again.");
    }

    console.log(`=== Existing user: ${JSON.stringify(existingUser)} ===`);

    const [accessToken, refreshToken] = await Promise.all([
      generateToken(userPayload(existingUser), "access"),
      generateToken(userPayload(existingUser), "refresh"),
    ]);

    existingUser.refreshToken = refreshToken;
    await existingUser.save();

    return Promise.resolve({
      statusCode: OK,
      data: {
        userId: existingUser.id,
        accessToken,
        refreshToken,
      },
    });
  } catch (e) {
    logger.error(`::: Failed to login with error: [${e}] :::`);
    throw new BadRequestError(e.message || "Failed to login");
  }
};

// TODO: CREATE USER PASSWORD REFRESH TOKEN
export const createForgotPasswordToken = async ({ params }) => {
  try {
    if (!params) {
      throw new BadRequestError("Request body is required");
    }

    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
    });

    const validateSchema = schema.validate(params);
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }

    const { email } = params;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("User does not exist.");
    }

    const token = generateToken({ email }, "forgotPassword");

    await User.findOneAndUpdate(
      { _id: existingUser.id },
      { $set: { forgotPasswordToken: token } },
      { new: true },
    );
    logger.info("::: Reset password token successfully sent to the email. :::");

    return Promise.resolve({
      statusCode: OK,
      data: {
        message: "Reset password token sent to email",
        token,
      },
    });
  } catch (e) {
    logger.error(
      `::: Failed to create password reset token with error: ${e} :::`,
    );
    throw new BadRequestError(
      e.message || "Failed to create password reset token",
    );
  }
};

// TODO: REFRESH TOKEN ENDPOINT
export const generateRefreshToken = async ({ refreshToken }) => {
  try {
    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required.");
    }

    const schema = Joi.object().keys({
      refreshToken: Joi.string().required(),
    });

    const validateSchema = schema.validate({ refreshToken });
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }
    console.log(`=== Incoming Refresh token: ${refreshToken} ===`);

    const payload = await verifyToken(refreshToken, "refresh");

    if (!payload) {
      logger.error(`::: Invalid refresh-token :::`);
      throw new BadRequestError("Invalid refresh-token");
    }

    const existingUser = await User.findOne({ userId: payload.userId });
    if (!existingUser) {
      throw new BadRequestError("User not found");
    }
    if (existingUser.refreshToken !== refreshToken) {
      logger.error(`::: Refresh token not recognised. :::`);
      throw new Error("Refresh token not recognised");
    }

    const [accessToken, newRefreshToken] = await Promise.all([
      generateToken(userPayload(existingUser), "access"),
      generateToken(userPayload(existingUser), "refresh"),
    ]);

    existingUser.refreshToken = newRefreshToken;
    await existingUser.save();

    logger.info(`::: Refresh token successfully generated :::`);

    return Promise.resolve({
      statusCode: OK,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (e) {
    logger.error(`::: Failed to refresh token: ${e} :::`);
    throw new BadRequestError(e.message || "Failed to refresh token");
  }
};

// TODO: USER LOGOUT
export const logOutUser = async ({ userId, refreshToken }) => {
  try {
    if (!refreshToken) {
      throw new BadRequestError("Refresh Token is required.");
    }

    const schema = Joi.object().keys({
      refreshToken: Joi.string().required(),
    });

    const validateSchema = schema.validate({ refreshToken });
    if (validateSchema.error) {
      throw new BadRequestError(validateSchema.error.details[0].message);
    }

    const existingUser = await User.findOne({ userId });
    if (!existingUser) {
      throw new BadRequestError("User not found");
    }

    if (existingUser.refreshToken !== refreshToken) {
      throw new BadRequestError("Invalid refresh token provided.");
    }

    existingUser.refreshToken = null;
    await existingUser.save();

    return Promise.resolve({
      statusCode: OK,
      data: "User logged out successfully",
    });
  } catch (e) {
    logger.error(`::: Failed to log out with error response [${e}] :::`);
    throw new BadRequestError(e.message || "Failed to log out");
  }
};
