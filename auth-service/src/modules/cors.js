import cors from "cors";
import Environment from "../auth/environment.js";

const corsMiddleware = cors({
  origin: process.env.NODE_ENV === Environment.PRODUCTION ? [""] : true,
  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;
