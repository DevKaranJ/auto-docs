import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure your .env file exists and is configured.");
}

export default defineConfig({
  out: "./migrations", // where migration files will be stored
  schema: "./shared/schema.ts", // path to your Drizzle schema
  dialect: "postgresql", // using PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
