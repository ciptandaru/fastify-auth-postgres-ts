import { FastifyPluginAsync } from "fastify";
import { AuthService } from "../services/auth.service";
import { RegisterRequest, LoginRequest } from "../types";

const authRoutes: FastifyPluginAsync = async (fastify, _options) => {
  const authService = new AuthService(fastify.db);

  // Register
  fastify.post<{ Body: RegisterRequest }>(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password", "full_name"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
            full_name: { type: "string", minLength: 1 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  email: { type: "string" },
                  full_name: { type: "string" },
                  role: { type: "string" },
                },
              },
              token: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await authService.register(request.body);

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      reply.code(201).send({ user, token });
    }
  );

  // Login
  fastify.post<{ Body: LoginRequest }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  email: { type: "string" },
                  full_name: { type: "string" },
                  role: { type: "string" },
                },
              },
              token: { type: "string" },
            },
          },
        },
      },
    },
    async (request, _reply) => {
      const { email, password } = request.body;
      const user = await authService.login(email, password);

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return { user, token };
    }
  );

  // Get current user
  fastify.get(
    "/me",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const result = await fastify.db.query(
        `SELECT id, email, full_name, role, is_active, created_at
       FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return reply.code(404).send({ error: "User not found" });
      }

      return result.rows[0];
    }
  );
};

export default authRoutes;
