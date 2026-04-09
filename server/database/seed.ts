// server/database/seed.ts
import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema';

config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toCamelCase(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// Convert ISO strings to Date objects
function reviveDates(obj: any) {
  if (Array.isArray(obj)) {
    obj.forEach(reviveDates);
  } else if (obj && typeof obj === 'object') {
    for (const key in obj) {
      const val = obj[key];
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
        obj[key] = new Date(val);
      } else if (typeof val === 'object') {
        reviveDates(val);
      }
    }
  }
}

// Reset sequences for serial IDs
async function resetSequence(tableName: string) {
  // Only reset sequence if the table has an 'id' column
  const skipTables = ['tenantProperties', 'tenantFavorites']; // junction tables
  if (skipTables.includes(tableName)) return;

  const quotedName = `"${tableName}"`;
  const result = await db.execute(sql.raw(`SELECT MAX(id) as max_id FROM ${quotedName}`));
  const maxId = (result.rows?.[0]?.max_id ?? 0) as number;
  const nextId = maxId + 1;

  await db.execute(
    sql.raw(`SELECT setval(pg_get_serial_sequence('${quotedName}', 'id'), ${nextId}, false)`)
  );

  console.log(`Reset sequence for ${tableName} to ${nextId}`);
}


// Delete all table data
async function clearTables(tableNames: string[]) {
  for (const table of tableNames) {
    const tbl = (schema as any)[table];
    if (!tbl) {
      console.warn(`Table ${table} not found in schema`);
      continue;
    }

    try {
      await db.delete(tbl);
      console.log(`Cleared data from ${table}`);
    } catch (err) {
      console.error(`Error clearing data from ${table}:`, err);
    }
  }
}

// Load JSON from file
function loadJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function main() {
  const dataDir = path.join(__dirname, 'seedData');

  // Tables in order (junction tables last)
  const tables = [
    'location',
    'manager',
    'property',
    'tenant',
    'lease',
    'application',
    'payment',
    'tenantProperties',
    'tenantFavorites',
  ];

  await clearTables([...tables].reverse());

  // Seed each main table
  for (const table of tables) {
    const fileName = table.replace(/([A-Z])/g, '_$1').toLowerCase() + '.json'; // e.g., tenantProperties -> tenant_properties.json
    const filePath = path.join(dataDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`Seed file not found for table ${table}: ${filePath}`);
      continue;
    }

    let data = loadJson(filePath);
    reviveDates(data);

    // Special handling for location coordinates (PostGIS)
    if (table === 'location') {
      for (const loc of data) {
        try {
          await db.execute(
            sql`INSERT INTO "location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
                VALUES (${loc.id}, ${loc.country}, ${loc.city}, ${loc.state}, ${loc.address}, ${loc.postalCode}, ${loc.coordinates})`
          );
        } catch (err) {
          console.error(`Error inserting location ${loc.city}:`, err);
        }
      }
    } else {
      const tbl = (schema as any)[toCamelCase(table)];
      if (!tbl) continue;
      try {
        await db.insert(tbl).values(data);
        console.log(`Seeded ${table}`);
      } catch (err) {
        console.error(`Error seeding ${table}:`, err);
      }
    }

    await resetSequence(table);
    await sleep(200);
  }

  await pool.end();
  console.log('✅ Database seeding complete');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
