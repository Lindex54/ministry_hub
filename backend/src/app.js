import express from "express";
import cors from "cors";
import morgan from "morgan";
import { corsOptions } from "./config/cors.js";
import { environment } from "./config/environment.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { apiRateLimiter, securityHeaders } from "./middleware/security.middleware.js";
import { router as apiRouter } from "./routes/index.js";

const app = express();

app.set("trust proxy", 1);
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
if (!environment.isProduction) app.use(morgan("dev"));

app.use("/api", apiRateLimiter, apiRouter);
app.use("/api", notFoundHandler);
app.use(errorHandler);

export default app;
