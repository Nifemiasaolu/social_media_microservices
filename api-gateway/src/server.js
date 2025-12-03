import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import securityMiddleware from "./modules/helmet.js";
import corsMiddleware from "./modules/cors.js";
import { requestLimiter } from "./modules/rate-limiter.js";
import registerProxies from "./modules/proxy.js";
import errorHandler from "./errorHandler.js";

dotenv.config();
const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(securityMiddleware);
server.use(corsMiddleware);

server.use(requestLimiter);

registerProxies(server);

server.use(errorHandler);
export default server;
