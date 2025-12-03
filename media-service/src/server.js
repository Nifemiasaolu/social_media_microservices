import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import errorHandler from "./errorHandler.js";
import connect from "./db.js";
import { rateLimiter } from "./modules/rate-limiter.js";
import securityMiddleware from "./modules/helmet.js";
import corsMiddleware from "./modules/cors.js";
import { authenticateUser } from "./modules/auth-service.js";
import media from "./media/index.js";

dotenv.config();

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.use(securityMiddleware);
server.use(corsMiddleware);
server.use(rateLimiter);

server.use(authenticateUser);
server.use(errorHandler);

connect()
  .then(() => {})
  .catch(() => {});

media({ server, subDomain: "/media" });

export default server;
