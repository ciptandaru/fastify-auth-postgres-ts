import fp from "fastify-plugin";
import { FastifyPluginAsync } from "fastify";
import { Pool } from "pg";
import databaseConfig from "../config/database";

const postgresPlugin: FastifyPluginAsync = async (fastify) => {
  const pool = new Pool(databaseConfig);

  // Test connection
  try {
    const client = await pool.connect();
    fastify.log.info("PostgreSQL connected successfully");
    client.release();
  } catch (err) {
    fastify.log.error("PostgreSQL connection error:");
    throw err;
  }

  // Decorate fastify with db
  fastify.decorate("db", {
    pool,
    async query(text: string, params?: any[]) {
      return pool.query(text, params);
    },
    async getClient() {
      return pool.connect();
    },
  });

  // Close pool on app close
  fastify.addHook("onClose", async (instance) => {
    await instance.db.pool.end();
    fastify.log.info("PostgreSQL connection closed");
  });
};

export default fp(postgresPlugin, {
  name: "postgres",
  dependencies: [],
});
