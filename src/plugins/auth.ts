import fp from "fastify-plugin";
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import jwt from "@fastify/jwt";

const authPlugin: FastifyPluginAsync = async (fastify, _options) => {
  // Register JWT
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || "supersecret",
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    },
  });

  // Authentication decorator
  fastify.decorate(
    "authenticate",
    async function (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid or expired token",
        });
      }
    }
  );

  // Authorization decorator
  fastify.decorate("authorize", (allowedRoles: string[] = []) => {
    return async function (
      request: FastifyRequest,
      reply: FastifyReply
    ): Promise<void> {
      if (!request.user) {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Authentication required",
        });
      }

      if (allowedRoles.length && !allowedRoles.includes(request.user.role)) {
        return reply.code(403).send({
          error: "Forbidden",
          message: "Insufficient permissions",
        });
      }
    };
  });
};

export default fp(authPlugin);
