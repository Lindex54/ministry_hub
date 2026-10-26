import path from "node:path";
import { fileURLToPath } from "node:url";
import next from "next";
import app from "./app.js";
import { environment } from "./config/environment.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(currentDirectory, "../../frontend");
const isDevelopment = environment.nodeEnv !== "production";
const frontend = next({ dev: isDevelopment, dir: frontendDirectory });
const handleFrontendRequest = frontend.getRequestHandler();

await frontend.prepare();

// Express owns /api routes; every other request is rendered by Next.js.
app.use((request, response) => handleFrontendRequest(request, response));

app.listen(environment.port, () => {
  console.log(`Ministry Hub listening on port ${environment.port}`);
});

