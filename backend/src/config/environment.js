import "dotenv/config";

function parseList(value) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV ?? "development";

export const environment = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT ?? 5000),
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  allowedOrigins: parseList(process.env.ALLOWED_ORIGINS),

  database: {
    // DATABASE_URL (mysql://user:password@host:port/database) takes priority when set.
    // Otherwise the discrete DB_* variables below are used — the usual shape for a
    // phpMyAdmin-managed MySQL instance.
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    name: process.env.DB_NAME ?? "",
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? "",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 300),
  },
};

export function isDatabaseConfigured() {
  return Boolean(environment.database.url) || Boolean(environment.database.name && environment.database.user);
}

export function isAuthConfigured() {
  return Boolean(environment.jwt.secret);
}
