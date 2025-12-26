import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString && process.env.NODE_ENV !== 'test') {
  console.warn('Warning: DATABASE_URL is not set. Database operations will fail at runtime.');
}

// Create a dummy connection for build time if DATABASE_URL is not set
const sql = connectionString ? neon(connectionString) : neon('postgresql://dummy:dummy@localhost:5432/dummy');
export const db = drizzle(sql, { schema });