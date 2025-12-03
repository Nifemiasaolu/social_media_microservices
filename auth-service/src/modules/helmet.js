import helmet from "helmet";
import Environment from "../auth/environment.js";

const securityMiddleware = helmet({
  contentSecurityPolicy:
    process.env.NODE_ENV === Environment.PRODUCTION ? undefined : false,
  crossOriginEmbedderPolicy: false,
});

export default securityMiddleware;
