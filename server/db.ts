import * as schema from "@shared/schema";

const isNeon = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.includes('neon');

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

let db: any;
let pool: any;

if (isNeon) {
  const { Pool, neonConfig } = await import('@neondatabase/serverless');
  const { drizzle } = await import('drizzle-orm/neon-serverless');
  const ws = (await import('ws')).default;

  neonConfig.webSocketConstructor = ws;
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  const { Pool } = await import('pg');
  const { drizzle } = await import('drizzle-orm/node-postgres');

  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle(pool, { schema });
}

export { db, pool };
