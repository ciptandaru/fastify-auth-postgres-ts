import { FastifyInstance } from "fastify";
import { UpdateUserRequest } from "../types";

export class UserService {
  private db: FastifyInstance["db"];

  constructor(db: FastifyInstance["db"]) {
    this.db = db;
  }

  async getAllUsers(): Promise<any[]> {
    const result = await this.db.query(
      `SELECT id, email, full_name, role, is_active, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async getUserById(id: number): Promise<any> {
    const result = await this.db.query(
      `SELECT id, email, full_name, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error("User not found") as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  async updateUser(id: number, updateData: UpdateUserRequest): Promise<any> {
    const { full_name, role, is_active } = updateData;

    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (full_name !== undefined) {
      fields.push(`full_name = $${paramCount}`);
      values.push(full_name);
      paramCount++;
    }

    if (role !== undefined) {
      fields.push(`role = $${paramCount}`);
      values.push(role);
      paramCount++;
    }

    if (is_active !== undefined) {
      fields.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }

    if (fields.length === 0) {
      return await this.getUserById(id);
    }

    values.push(id);

    const result = await this.db.query(
      `UPDATE users
       SET ${fields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, email, full_name, role, is_active, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      const error = new Error("User not found") as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    return result.rows[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      const error = new Error("User not found") as Error & {
        statusCode: number;
      };
      error.statusCode = 404;
      throw error;
    }

    return true;
  }
}
