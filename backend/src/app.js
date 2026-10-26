import express from "express";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use("/api", (_request, response) => {
  response.status(404).json({ message: "API route not found" });
});
app.use(errorHandler);

export default app;

