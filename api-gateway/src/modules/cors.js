import cors from "cors";

const corsMiddleware = cors({
  origin: process.env.NODE_ENV === "prod" ? [""] : true,
  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;
