import { drizzle } from 'drizzle-orm';
import { sql as vercelSql } from '@vercel/postgres';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from "dotenv";
dotenv.config({ path: '.env' });

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is not set in the environment variables");
}

let dbClient;

if (process.env.NODE_ENV === 'production') {
  dbClient = drizzle(vercelSql, { schema });
} else {
  const client = postgres(process.env.POSTGRES_URL);
  dbClient = drizzle(client, { schema });
}

export const db = dbClient;
