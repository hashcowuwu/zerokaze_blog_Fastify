// src/app.ts
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
// 1. Import the JWT plugin
import jwt from "@fastify/jwt";

import databasePlugin from "./plugins/database";
import authPlugin from "./plugins/auth"; // This plugin adds `server.authenticate`
import authRoutes from "./modules/auth /auth.route";
import articleRoutes from "./modules/article/article.route";
import adminRoutes from "./modules/admin/admin.route";

// You can use this for your secret!
// import config from "./config/auth";

const server = Fastify({
  logger: true,
});

// CORS setup looks correct for credentials
await server.register(cors, {
  origin: true,
  credentials: true,
});

// Cookie plugin (must be registered before JWT)
server.register(cookie, {
  secret: "hhj20041008%", // Tip: Use an environment variable for this secret
  parseOptions: {},
});

// 2. Register @fastify/jwt and tell it to read from a cookie
// This must come AFTER @fastify/cookie
server.register(jwt, {
  secret: "hhj20041008%", // This secret MUST match the one used to sign the token
  cookie: {
    cookieName: "authToken", // The name of the cookie to check for the JWT
    signed: false, // Set to true if you use signed cookies
  },
});

async function main() {
  await server.register(databasePlugin);

  // Your authPlugin adds the server.authenticate decorator, so register it here.
  await server.register(authPlugin);

  // Register routes
  await server.register(authRoutes, { prefix: "/auth" });
  await server.register(adminRoutes, { prefix: "/" });
  await server.register(articleRoutes, { prefix: "/blog" });

  try {
    // 3. (Minor fix) Corrected the port number in the log message
    await server.listen({ port: 4000 });
    console.log("Server listening on http://localhost:4000");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();

export default server;
