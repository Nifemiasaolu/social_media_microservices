import {
  createForgotPasswordToken,
  generateRefreshToken,
  loginUser,
  logOutUser,
  registerUser,
} from "./user.service.js";
import Environment from "../auth/environment.js";

export const signup = (req, res, next) => {
  const params = req.body;
  registerUser({ params })
    .then(({ statusCode, data }) => {
      res.status(statusCode).json({
        status: true,
        data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const login = (req, res, next) => {
  const params = req.body;

  loginUser({ params })
    .then((dataObj) => {
      const { userId, accessToken, refreshToken } = dataObj.data;

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === Environment.PRODUCTION,
        sameSite:
          process.env.NODE_ENV === Environment.PRODUCTION ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(dataObj.statusCode).json({
        status: true,
        data: {
          userId,
          accessToken,
        },
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const generatePasswordResetToken = (req, res, next) => {
  const params = req.body;

  createForgotPasswordToken({ params })
    .then(({ statusCode, data }) => {
      res.status(statusCode).json({
        status: true,
        data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const getRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken;

  generateRefreshToken({ refreshToken })
    .then((dataObj) => {
      const { accessToken, refreshToken } = dataObj.data;
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === Environment.PRODUCTION,
        sameSite:
          process.env.NODE_ENV === Environment.PRODUCTION ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(dataObj.statusCode).json({
        status: true,
        data: {
          accessToken,
        },
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};

export const logOut = (req, res, next) => {
  const { userId } = req.user;
  const refreshToken = req.cookies?.refreshToken;

  logOutUser({ userId, refreshToken })
    .then(({ statusCode, data }) => {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === Environment.PRODUCTION,
        sameSite:
          process.env.NODE_ENV === Environment.PRODUCTION ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(statusCode).json({
        status: true,
        data,
      });
    })
    .catch((e) => {
      res.status(e.statusCode).json({
        status: false,
        message: e.message,
      });
    });
};
