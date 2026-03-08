import { sql as vercelSql } from '@vercel/postgres';
import postgres from 'postgres';
import * as schema from './schema';

let dbClient;

if (process.env.NODE_ENV === 'production') {
  const { drizzle } = require('drizzle-orm/vercel-postgres');
  dbClient = drizzle(vercelSql, { schema });
} else {
  const { drizzle } = require('drizzle-orm/postgres-js');
  const client = postgres(process.env.POSTGRES_URL!); // Added non-null assertion
  dbClient = drizzle(client, { schema });
}

export const db = dbClient;


