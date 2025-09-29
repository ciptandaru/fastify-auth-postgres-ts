import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import cors from "@fastify/cors";

const corsPlugin: FastifyPluginAsync = async (fastify, _options) => {
  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });
};

export default fp(corsPlugin);
