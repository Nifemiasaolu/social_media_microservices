import helmet from "helmet";

const securityMiddleware = helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "prod" ? undefined : false,
  crossOriginEmbedderPolicy: false,
});

export default securityMiddleware;
