import { FastifyPluginAsync } from "fastify";
import { UserService } from "../services/user.service";
import { UpdateUserRequest } from "../types";

const userRoutes: FastifyPluginAsync = async (fastify, _options) => {
  const userService = new UserService(fastify.db);

  // Get all users (admin only)
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate, fastify.authorize(["admin"])],
    },
    async (_request, _reply) => {
      const users = await userService.getAllUsers();
      return { users };
    }
  );

  // Get user by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = parseInt(request.params.id);

      // Users can only view their own profile, admins can view any
      if (request.user!.role !== "admin" && request.user!.id !== userId) {
        return reply.code(403).send({
          error: "Forbidden",
          message: "You can only view your own profile",
        });
      }

      const user = await userService.getUserById(userId);
      return user;
    }
  );

  // Update user (admin only)
  fastify.patch<{ Params: { id: string }; Body: UpdateUserRequest }>(
    "/:id",
    {
      preHandler: [fastify.authenticate, fastify.authorize(["admin"])],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
        body: {
          type: "object",
          properties: {
            full_name: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            is_active: { type: "boolean" },
          },
        },
      },
    },
    async (request, _reply) => {
      const userId = parseInt(request.params.id);
      const user = await userService.updateUser(userId, request.body);
      return user;
    }
  );

  // Delete user (admin only)
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      preHandler: [fastify.authenticate, fastify.authorize(["admin"])],
      schema: {
        params: {
          type: "object",
          properties: {
            id: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = parseInt(request.params.id);
      await userService.deleteUser(userId);
      reply.code(204).send();
    }
  );
};

export default userRoutes;
