import path from "node:path";
import { fileURLToPath } from "node:url";
import next from "next";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { environment } from "./config/environment.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDirectory = path.resolve(currentDirectory, "../../frontend");

// In production this process embeds Next.js itself and renders every
// non-API route — that's the single-process Hostinger deployment. In local
// dev, the frontend is normally already running separately (`cd frontend &&
// npm run dev` on :3000, proxied back to this API via
// frontend/next.config.mjs), so embedding Next here too would fight it for
// the same dev lock and Next exits the process outright when that happens —
// not a catchable error, so the only safe option is to never attempt it.
// Set EMBED_FRONTEND=true to force embedding during local dev anyway (e.g.
// if you're not running the frontend separately).
const shouldEmbedFrontend = environment.isProduction || process.env.EMBED_FRONTEND === "true";

// The database is attempted but never blocks startup: the frontend and the
// rest of the API (health checks, future public routes) must keep working
// even while MySQL is being set up.
await connectDatabase();

let handleFrontendRequest = null;
if (shouldEmbedFrontend) {
  const frontend = next({ dev: !environment.isProduction, dir: frontendDirectory });
  await frontend.prepare();
  handleFrontendRequest = frontend.getRequestHandler();
} else {
  console.log(
    "[server] Running API-only (EMBED_FRONTEND is not set). Run `cd frontend && npm run dev` " +
    "in a separate terminal for the UI — it proxies /api requests back to this server."
  );
}

// Express owns /api routes; every other request is rendered by Next.js when
// it's embedded here, or told where to go instead when it isn't.
app.use((request, response) => {
  if (handleFrontendRequest) return handleFrontendRequest(request, response);
  response.status(503).json({
    message: "This backend instance is running API-only. The frontend is served separately — " +
      "run `cd frontend && npm run dev` and open that server instead.",
  });
});

app.listen(environment.port, () => {
  console.log(`Ministry Hub listening on port ${environment.port}${handleFrontendRequest ? "" : " (API-only)"}`);
});
