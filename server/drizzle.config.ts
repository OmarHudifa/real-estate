/*import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  connectionString: String(process.env.DATABASE_URL),
});

export const db = drizzle(pool);

*/
// db.ts
import {config} from "dotenv"
import { defineConfig } from 'drizzle-kit';

config ({path:".env"})

export default defineConfig({
  out: './migrations',
  schema: './database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});