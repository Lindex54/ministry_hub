// In production, Express (backend/src/server.js) intercepts /api/* before Next.js
// ever sees it, so this rewrite never fires there. It only matters when the
// frontend dev server runs standalone (`npm run dev` inside frontend/, as opposed
// to the unified backend server), proxying /api/* to the separately running
// Express backend instead of 404ing.
const backendOrigin = process.env.BACKEND_ORIGIN ?? "http://localhost:5000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendOrigin}/api/:path*` }];
  },
};

export default nextConfig;
