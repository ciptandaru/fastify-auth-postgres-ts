import Fastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import corsPlugin from "./plugins/cors";
import postgresPlugin from "./plugins/postgres";
import authPlugin from "./plugins/auth";
import errorHandlerPlugin from "./plugins/error-handler";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";

async function build(
  opts: FastifyServerOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === "development"
        ? {
            transport: {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            },
          }
        : true,
    ...opts,
  });

  // Register plugins in correct order
  await app.register(corsPlugin);
  await app.register(postgresPlugin); // Make sure this is registered before using db
  await app.register(authPlugin);
  await app.register(errorHandlerPlugin);

  // Register routes
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(userRoutes, { prefix: "/api/users" });

  // Root route
  app.get("/", async (_request, _reply) => {
    return {
      message: "Fastify Auth & PostgreSQL API (TypeScript)",
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
      },
    };
  });

  // Health check
  app.get("/health", async (_request, reply) => {
    try {
      await app.db.query("SELECT 1");
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      return reply.code(503).send({
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      });
    }
  });

  return app;
}

export default build;
