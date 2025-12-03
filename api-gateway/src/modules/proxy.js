import proxy from "express-http-proxy";
import logger from "../logger.js";
import { INTERNAL_SERVER_ERROR } from "./status.js";
import { validateToken } from "../middleware.js";

const processServicesFromEnv = () => {
  const services = process.env.SERVICES || "";
  return services.split(",").reduce((acc, pair) => {
    const service = pair.split(":");
    const name = service[0];
    const url = service.length > 1 ? service.slice(1).join(":") : service[0];
    if (name && url) {
      acc[name.trim()] = url.trim();
    }
    return acc;
  }, {});
};

export const registerProxies = (server) => {
  const services = processServicesFromEnv();

  Object.entries(services).forEach(([route, target]) => {
    console.log(`==== Route: ${route} ===`);
    console.log(`==== Target: ${target} ===`);
    if (!target) {
      logger.error(`::: No target URL defined for service [${route}]`);
      return;
    }

    const proxyOptions = {
      stream: true, // ✅ Stream uploads directly, don't buffer large multipart/form-data in memory

      proxyReqPathResolver: (req) => req.originalUrl,

      proxyErrorHandler: (err, res, next) => {
        logger.error(`::: Proxy error: ${err.message} :::`);
        res.status(INTERNAL_SERVER_ERROR).json({
          status: false,
          message: err.message || "Internal server error",
        });
      },
    };

    const proxyMiddleware = proxy(target, {
      ...proxyOptions,
      proxyReqOptDecorator: (proxyReqOpts, secReq) => {
        const contentType = secReq.headers["content-type"];

        if (!contentType || !contentType.startsWith("multipart/form-data")) {
          proxyReqOpts.headers["Content-Type"] = "application/json";
        }

        if (secReq.user) {
          proxyReqOpts.headers["x-user-id"] = secReq.user.userId;
        }
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
          `::: Response received from [${route}-service]: [${proxyRes.statusCode}] :::`,
        );
        return proxyResData;
      },
    });

    const mainServices = process.env.MAIN_SERVICES;
    const protectedServices = mainServices
      ? mainServices.split(",").map((s) => s.trim())
      : [];

    // setup proxy for the various services.
    if (protectedServices.includes(route)) {
      server.use(`/${route}`, validateToken, proxyMiddleware);
    } else {
      server.use(`/${route}`, proxyMiddleware);
    }
    logger.info(`::: Registered proxy for [/${route}] => ${target} :::`);
  });
};

export default registerProxies;
