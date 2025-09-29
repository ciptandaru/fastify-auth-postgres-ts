import bcrypt from "bcrypt";
import { FastifyInstance } from "fastify";
import { RegisterRequest, UserResponse } from "../types";

export class AuthService {
  private db: FastifyInstance["db"];

  constructor(db: FastifyInstance["db"]) {
    this.db = db;
  }

  async register(userData: RegisterRequest): Promise<UserResponse> {
    const { email, password, full_name } = userData;

    // Check if user exists
    const existingUser = await this.db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      const error = new Error("User already exists") as Error & {
        statusCode: number;
      };
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await this.db.query(
      `INSERT INTO users (email, password, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, hashedPassword, full_name, "user"]
    );

    return result.rows[0];
  }

  async login(email: string, password: string): Promise<UserResponse> {
    // Find user
    const result = await this.db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      const error = new Error("Invalid credentials") as Error & {
        statusCode: number;
      };
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      const error = new Error("Account is disabled") as Error & {
        statusCode: number;
      };
      error.statusCode = 403;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error("Invalid credentials") as Error & {
        statusCode: number;
      };
      error.statusCode = 401;
      throw error;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword as UserResponse;
  }
}
