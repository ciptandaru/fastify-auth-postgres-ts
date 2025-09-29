# Fastify Authentication & PostgreSQL API (TypeScript)

A production-ready REST API built with Fastify, TypeScript, JWT authentication, and PostgreSQL. This project demonstrates best practices for building secure, type-safe, and scalable Node.js applications.

## 🚀 Features

- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Authentication**: JWT-based authentication with role-based access control (RBAC)
- **Database**: PostgreSQL with connection pooling and prepared statements
- **Security**: Password hashing with bcrypt, CORS protection, and secure headers
- **Validation**: Request/response validation using JSON Schema
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Developer Experience**: Hot reload, structured logging, and clear code organization
- **Production Ready**: Environment configuration, graceful shutdown, and health checks

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** - Comes with Node.js
- **DBeaver** (optional, for database management) - [Download](https://dbeaver.io/)
- **Postman** (optional, for API testing) - [Download](https://www.postman.com/)

## 📦 Installation

### 1. Clone or Create Project

```bash
mkdir fastify-auth-postgres-ts
cd fastify-auth-postgres-ts
```

### 2. Initialize Project

```bash
npm init -y
```

### 3. Install Dependencies

```bash
# Core dependencies
npm install fastify @fastify/jwt @fastify/cors pg bcrypt dotenv fastify-plugin

# TypeScript and types
npm install -D typescript @types/node @types/pg @types/bcrypt ts-node nodemon

# Optional: Pretty logging in development
npm install -D pino-pretty
```

### 4. Create Project Structure

```bash
mkdir -p src/{config,plugins,routes,services,types} migrations
```

## 🗄️ Database Setup

### Using DBeaver

#### 1. Create Connection

1. Open DBeaver
2. Click **Database** → **New Database Connection**
3. Select **PostgreSQL**
4. Enter connection details:
   - **Host**: `localhost`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **Username**: `postgres`
   - **Password**: `your_password`
5. Click **Test Connection** → **Finish**

#### 2. Create Database

Execute the following SQL:

```sql
CREATE DATABASE fastify_auth_db;
```

#### 3. Run Migration

1. Connect to `fastify_auth_db` database
2. Open SQL Editor (SQL → SQL Editor)
3. Copy and paste the migration script from `migrations/001_initial_schema.sql`
4. Execute the script (Ctrl+Enter or Execute button)

#### 4. Verify Setup

```sql
-- Check if table exists
SELECT * FROM users;

-- Should show admin user
SELECT email, role FROM users WHERE email = 'admin@example.com';
```

### Using psql (Command Line)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE fastify_auth_db;

# Connect to the database
\c fastify_auth_db

# Run migration (from project root)
\i migrations/001_initial_schema.sql

# Verify
SELECT * FROM users;

# Exit
\q
```

## ⚙️ Configuration

### 1. Create .env File

Create a `.env` file in the project root:

```env
# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
LOG_LEVEL=info

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fastify_auth_db
DB_USER=postgres
DB_PASSWORD=your_actual_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=24h
```

### 2. Important Configuration Notes

⚠️ **Security Best Practices:**

- **Never commit `.env` to version control**
- Use strong, unique `JWT_SECRET` (minimum 32 characters)
- Use different secrets for development and production
- Change default admin password immediately

### 3. Environment Variables Explained

| Variable         | Description                                       | Default         | Required |
| ---------------- | ------------------------------------------------- | --------------- | -------- |
| `NODE_ENV`       | Environment (development/production/test)         | development     | No       |
| `PORT`           | Server port                                       | 3000            | No       |
| `HOST`           | Server host                                       | 0.0.0.0         | No       |
| `LOG_LEVEL`      | Logging level (fatal/error/warn/info/debug/trace) | info            | No       |
| `DB_HOST`        | PostgreSQL host                                   | localhost       | No       |
| `DB_PORT`        | PostgreSQL port                                   | 5432            | No       |
| `DB_NAME`        | Database name                                     | fastify_auth_db | No       |
| `DB_USER`        | Database username                                 | postgres        | Yes      |
| `DB_PASSWORD`    | Database password                                 | -               | Yes      |
| `JWT_SECRET`     | JWT secret key                                    | -               | Yes      |
| `JWT_EXPIRES_IN` | Token expiration time                             | 24h             | No       |

## 🏃 Running the Application

### Development Mode

```bash
# With auto-reload on file changes
npm run dev

# Alternative: with watch mode
npm run dev:watch
```

The server will start at `http://localhost:3000`

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Run production build
npm start
```

### Verify Server is Running

Open browser or use curl:

```bash
curl http://localhost:3000
```

Expected response:

```json
{
  "message": "Fastify Auth & PostgreSQL API (TypeScript)",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users"
  }
}
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

### Endpoints Overview

| Method | Endpoint             | Description       | Auth Required | Admin Only |
| ------ | -------------------- | ----------------- | ------------- | ---------- |
| GET    | `/`                  | API information   | No            | No         |
| GET    | `/health`            | Health check      | No            | No         |
| POST   | `/api/auth/register` | Register new user | No            | No         |
| POST   | `/api/auth/login`    | Login user        | No            | No         |
| GET    | `/api/auth/me`       | Get current user  | Yes           | No         |
| GET    | `/api/users`         | Get all users     | Yes           | Yes        |
| GET    | `/api/users/:id`     | Get user by ID    | Yes           | Partial    |
| PATCH  | `/api/users/:id`     | Update user       | Yes           | Yes        |
| DELETE | `/api/users/:id`     | Delete user       | Yes           | Yes        |

---

### 🔓 Public Endpoints

#### 1. Get API Info

```http
GET /
```

**Response:**

```json
{
  "message": "Fastify Auth & PostgreSQL API (TypeScript)",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users"
  }
}
```

#### 2. Health Check

```http
GET /health
```

**Response (200 OK):**

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-09-29T10:30:00.000Z"
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "error",
  "database": "disconnected",
  "timestamp": "2025-09-29T10:30:00.000Z"
}
```

---

### 🔐 Authentication Endpoints

#### 1. Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Validation Rules:**

- `email`: Must be valid email format
- `password`: Minimum 6 characters
- `full_name`: Minimum 1 character

**Success Response (201 Created):**

```json
{
  "user": {
    "id": 2,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2025-09-29T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (409 Conflict):**

```json
{
  "error": "Error",
  "message": "User already exists"
}
```

#### 2. Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Success Response (200 OK):**

```json
{
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-09-29T10:00:00.000Z",
    "updated_at": "2025-09-29T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401 Unauthorized):**

```json
{
  "error": "Error",
  "message": "Invalid credentials"
}
```

**Error Response (403 Forbidden):**

```json
{
  "error": "Error",
  "message": "Account is disabled"
}
```

#### 3. Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "email": "admin@example.com",
  "full_name": "Admin User",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-09-29T10:00:00.000Z"
}
```

---

### 👥 User Management Endpoints

#### 1. Get All Users (Admin Only)

```http
GET /api/users
Authorization: Bearer <admin_token>
```

**Success Response (200 OK):**

```json
{
  "users": [
    {
      "id": 1,
      "email": "admin@example.com",
      "full_name": "Admin User",
      "role": "admin",
      "is_active": true,
      "created_at": "2025-09-29T10:00:00.000Z",
      "updated_at": "2025-09-29T10:00:00.000Z"
    },
    {
      "id": 2,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "is_active": true,
      "created_at": "2025-09-29T10:30:00.000Z",
      "updated_at": "2025-09-29T10:30:00.000Z"
    }
  ]
}
```

#### 2. Get User by ID

```http
GET /api/users/:id
Authorization: Bearer <token>
```

**Authorization Rules:**

- Regular users can only view their own profile
- Admins can view any user profile

**Success Response (200 OK):**

```json
{
  "id": 2,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true,
  "created_at": "2025-09-29T10:30:00.000Z",
  "updated_at": "2025-09-29T10:30:00.000Z"
}
```

**Error Response (403 Forbidden):**

```json
{
  "error": "Forbidden",
  "message": "You can only view your own profile"
}
```

#### 3. Update User (Admin Only)

```http
PATCH /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "full_name": "Updated Name",
  "role": "admin",
  "is_active": false
}
```

**All fields are optional:**

- `full_name`: String
- `role`: "user" or "admin"
- `is_active`: Boolean

**Success Response (200 OK):**

```json
{
  "id": 2,
  "email": "user@example.com",
  "full_name": "Updated Name",
  "role": "admin",
  "is_active": false,
  "created_at": "2025-09-29T10:30:00.000Z",
  "updated_at": "2025-09-29T11:00:00.000Z"
}
```

#### 4. Delete User (Admin Only)

```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

**Success Response (204 No Content):**

```
(Empty response body)
```

**Error Response (404 Not Found):**

```json
{
  "error": "Error",
  "message": "User not found"
}
```

---

### ❌ Error Responses

All errors follow a consistent format:

**Validation Error (400):**

```json
{
  "error": "Validation Error",
  "message": "Request validation failed",
  "details": [
    {
      "message": "must have required property 'email'",
      "dataPath": ".body"
    }
  ]
}
```

**Unauthorized (401):**

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Forbidden (403):**

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

**Not Found (404):**

```json
{
  "error": "Not Found",
  "message": "Route GET /api/invalid not found"
}
```

**Internal Server Error (500):**

```json
{
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## 🧪 Testing with Postman

### Setup Postman Environment

1. Open Postman
2. Click **Environments** → **Create Environment**
3. Name it: `Fastify Auth Local`
4. Add variables:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty)

### Import Collection

Create a new collection and add the following requests:

#### 1. Login (Admin)

- **Method**: POST
- **URL**: `{{base_url}}/api/auth/login`
- **Body** (raw JSON):

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

- **Tests** (to auto-save token):

```javascript
if (pm.response.code === 200) {
  const jsonData = pm.response.json();
  pm.environment.set("token", jsonData.token);
  console.log("Token saved:", jsonData.token);
}
```

#### 2. Register New User

- **Method**: POST
- **URL**: `{{base_url}}/api/auth/register`
- **Body** (raw JSON):

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "full_name": "New User"
}
```

- **Tests**:

```javascript
if (pm.response.code === 201) {
  const jsonData = pm.response.json();
  pm.environment.set("token", jsonData.token);
  pm.environment.set("user_id", jsonData.user.id);
}
```

#### 3. Get Current User

- **Method**: GET
- **URL**: `{{base_url}}/api/auth/me`
- **Headers**:
  - Key: `Authorization`
  - Value: `Bearer {{token}}`

#### 4. Get All Users (Admin)

- **Method**: GET
- **URL**: `{{base_url}}/api/users`
- **Headers**:
  - Key: `Authorization`
  - Value: `Bearer {{token}}`

#### 5. Update User

- **Method**: PATCH
- **URL**: `{{base_url}}/api/users/2`
- **Headers**:
  - Key: `Authorization`
  - Value: `Bearer {{token}}`
- **Body** (raw JSON):

```json
{
  "full_name": "Updated User Name",
  "is_active": true
}
```

### Testing Workflow

1. **Login as Admin** → Token saved automatically
2. **Register New User** → Can optionally save their token
3. **Get Current User** → Verify authentication works
4. **Get All Users** → Should work (admin access)
5. **Update User** → Should work (admin access)
6. **Login as Regular User** → Switch to regular user token
7. **Try Get All Users** → Should fail with 403 (insufficient permissions)

## 📁 Project Structure

```
fastify-auth-postgres-ts/
├── src/
│   ├── config/
│   │   └── database.ts           # Database configuration
│   ├── plugins/
│   │   ├── auth.ts                # JWT authentication plugin
│   │   ├── cors.ts                # CORS configuration
│   │   ├── postgres.ts            # PostgreSQL connection
│   │   └── error-handler.ts      # Global error handling
│   ├── routes/
│   │   ├── auth.ts                # Authentication routes
│   │   └── users.ts               # User management routes
│   ├── services/
│   │   ├── auth.service.ts        # Authentication business logic
│   │   └── user.service.ts        # User business logic
│   ├── types/
│   │   ├── index.ts               # Type definitions
│   │   └── fastify.d.ts           # Fastify type extensions
│   ├── app.ts                     # Fastify app setup
│   └── server.ts                  # Server entry point
├── migrations/
│   └── 001_initial_schema.sql    # Database schema
├── dist/                          # Compiled JavaScript (after build)
├── node_modules/                  # Dependencies
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project metadata
└── README.md                      # This file
```

## 👨‍💻 Development Guide

### Code Organization

- **Routes**: Handle HTTP requests and responses
- **Services**: Contain business logic and database operations
- **Plugins**: Extend Fastify functionality
- **Types**: Define TypeScript interfaces and types

### Adding New Features

#### 1. Create New Database Table

Add migration in `migrations/002_new_feature.sql`:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Define Types

Add to `src/types/index.ts`:

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  created_at: Date;
}
```

#### 3. Create Service

Create `src/services/product.service.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { Product } from "../types";

export class ProductService {
  private db: FastifyInstance["db"];

  constructor(db: FastifyInstance["db"]) {
    this.db = db;
  }

  async getAll(): Promise<Product[]> {
    const result = await this.db.query<Product>(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return result.rows;
  }
}
```

#### 4. Create Routes

Create `src/routes/products.ts`:

```typescript
import { FastifyPluginAsync } from "fastify";
import { ProductService } from "../services/product.service";

const productRoutes: FastifyPluginAsync = async (fastify, options) => {
  const productService = new ProductService(fastify.db);

  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async (request, reply) => {
      const products = await productService.getAll();
      return { products };
    }
  );
};

export default productRoutes;
```

#### 5. Register Routes

In `src/app.ts`:

```typescript
import productRoutes from "./routes/products";

// In build function:
await app.register(productRoutes, { prefix: "/api/products" });
```

### Type Safety Tips

1. **Always define interfaces** for request/response data
2. **Use generics** for database queries
3. **Type route handlers** with Fastify's generic types
4. **Extend Fastify types** when adding decorators

### Database Best Practices

1. **Use prepared statements** (automatically handled by pg)
2. **Never concatenate SQL** strings with user input
3. **Use transactions** for multiple related operations
4. **Index frequently queried columns**
5. **Validate data** before database operations

## 🚀 Deployment

### Environment Variables

Create production `.env`:

```env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=fastify_auth_db
DB_USER=your-db-user
DB_PASSWORD=your-secure-password

JWT_SECRET=your-very-long-and-secure-random-string-min-32-chars
JWT_EXPIRES_IN=1h
```

### Build for Production

```bash
# Install dependencies
npm ci --only=production

# Build TypeScript
npm run build

# Start server
NODE_ENV=production node dist/server.js
```

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/server.js --name fastify-api

# View logs
pm2 logs fastify-api

# Restart
pm2 restart fastify-api

# Stop
pm2 stop fastify-api
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Build and run:

```bash
docker build -t fastify-api .
docker run -p 3000:3000 --env-file .env fastify-api
```

### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure CORS for specific origins
- [ ] Use environment variables for secrets
- [ ] Enable PostgreSQL SSL connection
- [ ] Implement password complexity requirements
- [ ] Add request logging
- [ ] Set up monitoring and alerts

## 🔍 Troubleshooting

### Database Connection Issues

**Problem**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solutions**:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# On macOS with Homebrew
brew services list
brew services start postgresql
```

### Authentication Errors

**Problem**: `401 Unauthorized - Invalid or expired token`

**Solutions**:

- Ensure token is included in Authorization header
- Check token format: `Bearer <token>`
- Verify JWT_SECRET matches between token creation and verification
- Check if token has expired

### TypeScript Compilation Errors

**Problem**: Type errors during development

**Solutions**:

```bash
# Clean build directory
rm -rf dist

# Rebuild
npm run build

# Check TypeScript configuration
npx tsc --showConfig
```

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solutions**:

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

### Database Migration Issues

**Problem**: Migration fails or tables not created

**Solutions**:

```sql
-- Drop and recreate database
DROP DATABASE fastify_auth_db;
CREATE DATABASE fastify_auth_db;

-- Connect and run migration again
\c fastify_auth_db
\i migrations/001_initial_schema.sql
```

## 📝 Scripts Reference

| Command             | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Start development server with auto-reload |
| `npm run dev:watch` | Start with file watching                  |
| `npm run build`     | Compile TypeScript to JavaScript          |
| `npm start`         | Run production build                      |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Fastify Documentation](https://www.fastify.io/)
3. Check [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 📚 Additional Resources

- [Fastify Official Docs](https://www.fastify.io/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Built with ❤️ using Fastify, TypeScript, and PostgreSQL**
