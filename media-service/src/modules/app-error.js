import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  NOT_FOUND,
  UN_AUTHORISED,
} from "./status.js";

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, BAD_REQUEST);
  }
}

class NotFoundError extends AppError {
  constructor(message = "Not Found") {
    super(message, NOT_FOUND);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, UN_AUTHORISED);
  }
}

class InternalServerError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, INTERNAL_SERVER_ERROR);
  }
}

export {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  InternalServerError,
};
