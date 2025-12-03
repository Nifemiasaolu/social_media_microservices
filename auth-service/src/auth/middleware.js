import logger from "../logger.js";
import { validateUserToken } from "./auth.service.js";
import { UN_AUTHORISED } from "../modules/status.js";
import { getRoutePermission } from "./roleAccessMap.js";
import { requestLimiter } from "../modules/rate-limiter.js";

const allowedRoutes = [
  {
    path: "auth/sign-up",
    limiter: requestLimiter,
  },
  {
    path: "auth/login",
    limiter: requestLimiter,
  },
  {
    path: "auth/password-reset-token",
    limiter: requestLimiter,
  },
  {
    path: "auth/refresh-token",
    limiter: requestLimiter,
  },
];

const matchAllowedRoutes = (req) => {
  const { path } = req;
  logger.info(`Checking route [${req.path}] against allowed routes...`);
  return allowedRoutes.find((route) => path.includes(route.path));
};

const secureRoute = async (req, res, next) => {
  const publicRoute = matchAllowedRoutes(req);
  if (publicRoute) {
    return publicRoute.limiter(req, res, next);
  } else {
    logger.error(`::: Public route [${req.path}] not found :::`);
  }

  const bearerToken = req.headers.authorization;
  if (!bearerToken) {
    logger.error(`::: No valid token is provided :::`);
    return res.status(UN_AUTHORISED).json({
      status: false,
      message: "Bearer token is required",
    });
  }

  console.log(`=== Bearer token: ${JSON.stringify(bearerToken)} ===`);
  const token = bearerToken.split(" ")[1];
  if (!token) {
    return res.status(UN_AUTHORISED).json({
      status: false,
      message: "Session expired. Please login with your valid credentials.",
    });
  }
  try {
    req.user = await validateUserToken({ token });

    const allowedRoles = getRoutePermission(req);

    if (!allowedRoles) {
      // Route is not protected by RoleAccessMap, just continue
      return next();
    }

    if (Array.isArray(allowedRoles) && !allowedRoles.includes(req.user.role)) {
      logger.error(
        `::: Access denied for role [${req.user.role}] on method [${req.method}] path [${req.original}] :::`,
      );
      return res.status(UN_AUTHORISED).json({
        status: false,
        message:
          "Access denied. You don't have permission to access this resource.",
      });
    }

    return next();
  } catch (e) {
    logger.error(`::: Token validation failed with error: ${e.message} :::`);
    return res.status(e.statusCode || UN_AUTHORISED).json({
      status: false,
      message: e.message || "Your session has expired.",
    });
  }
};

export default secureRoute;
