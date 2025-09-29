import { Pool, QueryResult } from "pg";
import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    db: {
      pool: Pool;
      query: <T = any>(text: string, params?: any[]) => Promise<QueryResult>;
      getClient: () => Promise<PoolClient>;
    };
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise;
    authorize: (
      roles?: string[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise;
  }

  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
      role: string;
    };
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      role: string;
    };
    user: {
      id: number;
      email: string;
      role: string;
    };
  }
}
