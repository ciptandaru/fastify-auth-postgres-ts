import fp from "fastify-plugin";
import {
  FastifyPluginAsync,
  FastifyError,
  FastifyRequest,
  FastifyReply,
} from "fastify";

const errorHandlerPlugin: FastifyPluginAsync = async (fastify, _options) => {
  fastify.setErrorHandler(
    async (
      error: FastifyError,
      request: FastifyRequest,
      reply: FastifyReply
    ) => {
      const { statusCode = 500, message } = error;

      fastify.log.error({
        error: message,
        stack: error.stack,
        url: request.url,
        method: request.method,
      });

      // Validation errors
      if (error.validation) {
        return reply.status(400).send({
          error: "Validation Error",
          message: "Request validation failed",
          details: error.validation,
        });
      }

      // JWT errors
      if (error.message && error.message.includes("jwt")) {
        return reply.status(401).send({
          error: "Unauthorized",
          message: "Invalid or expired token",
        });
      }

      // Custom application errors
      if (error.statusCode) {
        return reply.status(statusCode).send({
          error: error.name || "Error",
          message: message,
        });
      }

      // Generic server errors
      return reply.status(500).send({
        error: "Internal Server Error",
        message:
          process.env.NODE_ENV === "development"
            ? message
            : "Something went wrong",
      });
    }
  );

  // Not found handler
  fastify.setNotFoundHandler(
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(404).send({
        error: "Not Found",
        message: `Route ${request.method} ${request.url} not found`,
      });
    }
  );
};

export default fp(errorHandlerPlugin);
