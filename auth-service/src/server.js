import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import secureRoute from "./auth/middleware.js";
import errorHandler from "./errorHandler.js";
import connect from "./db.js";
import auth from "./user/index.js";
import { rateLimiter } from "./modules/rate-limiter.js";
import securityMiddleware from "./modules/helmet.js";
import corsMiddleware from "./modules/cors.js";

dotenv.config();

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use(securityMiddleware);
server.use(corsMiddleware);

server.use(rateLimiter);

server.use(secureRoute);
server.use(errorHandler);

connect()
  .then(() => {})
  .catch(() => {});

auth({ server, subDomain: "/auth" });

export default server;
