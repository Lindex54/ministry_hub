import { environment } from "./environment.js";

export const corsOptions = {
  origin: environment.frontendUrl,
  credentials: true,
};

