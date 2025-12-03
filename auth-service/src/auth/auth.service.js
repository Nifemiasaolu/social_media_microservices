// TODO: USER REGISTRATION
import Joi from "joi";
import jwt from "jsonwebtoken";

import { BadRequestError, UnauthorizedError } from "../modules/app-error.js";
import logger from "../logger.js";
import User from "../user/user.model.js";
import { OK } from "../modules/status.js";

export const generateToken = (payload, type) => {
  let secret;
  let expiresIn;

  switch (type) {
    case "access":
      secret = process.env.JWT_SECRET;
      expiresIn = process.env.EXPIRES_IN;
      break;

    case "refresh":
      secret = process.env.REFRESH_TOKEN_SECRET;
      expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN;
      break;

    case "forgotPassword":
      secret = process.env.FORGOT_PASSWORD_TOKEN_SECRET;
      expiresIn = process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN;
      break;

    default:
      return `Type ${type} not found.`;
  }

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token, type) => {
  return new Promise((resolve, reject) => {
    let secret;
    switch (type) {
      case "access":
        secret = process.env.JWT_SECRET;
        break;

      case "refresh":
        secret = process.env.REFRESH_TOKEN_SECRET;
        break;

      case "forgotPassword":
        secret = process.env.FORGOT_PASSWORD_TOKEN_SECRET;
        break;

      default:
        return `Type ${type} not found.`;
    }

    jwt.verify(token, secret, (err, payload) => {
      if (err) {
        logger.error(`::: Invalid token with error [${err}] :::`);
        reject(err.message);
      }
      resolve(payload);
    });
  });
};

export const resetPassword = (params) => {
  if (!params) {
    throw new BadRequestError("Request body is required.");
  }

  const schema = Joi.object().key({
    password: Joi.string().required(),
    token: Joi.string().required(),
  });

  const { password, token } = params;
};

export const validateUserToken = async ({ token }) => {
  if (!token) {
    throw new BadRequestError("Token is required");
  }
  const schema = Joi.object().keys({
    token: Joi.string().required(),
  });
  const validateSchema = schema.validate({ token });
  if (validateSchema.error) {
    throw new BadRequestError(validateSchema.error.details[0].message);
  }

  try {
    const payload = await verifyToken(token, "access");
    return User.findOne({ userId: payload.userId })
      .then((res) => {
        return {
          username: res.username,
          userId: res.userId,
          email: res.email,
          role: res.role,
        };
      })
      .catch((e) => {
        logger.error(
          `::: Fetching user with payload [${payload}] failed` +
            ` with error [${JSON.stringify(e)}] :::`,
        );

        throw new UnauthorizedError(
          "Your session has expired. Please re-sign your credentials.",
        );
      });
  } catch (e) {
    logger.error(
      `::: Failed to validate token with error response: ${JSON.stringify(e)} :::`,
    );
    throw new UnauthorizedError(
      e.message || "Your session has expired. Please resign your credentials",
    );
  }
};
