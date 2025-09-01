// server/seed.ts

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from './schema'; // <-- update to your actual schema path

config({ path: '.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

// ✅ Utility to convert ISO date strings to real Date objects recursively
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

async function insertLocationData(locations: any[]) {
  for (const location of locations) {
    const { id, country, city, state, address, postalCode, coordinates } = location;
    try {
      await db.execute(
        sql`INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
            VALUES (${id}, ${country}, ${city}, ${state}, ${address}, ${postalCode}, ST_GeomFromText(${coordinates}, 4326))`
      );
      console.log(`Inserted location for ${city}`);
    } catch (error) {
      console.error(`Error inserting location for ${city}:`, error);
    }
  }
}

async function resetSequence(modelName: string) {
  const quotedModelName = `"${toPascalCase(modelName)}"`;

  const result = await db.execute(
    sql.raw(`SELECT MAX(id) as max_id FROM ${quotedModelName}`)
  );

  const maxId = (result.rows?.[0]?.max_id ?? 0) as number;
  const nextId = maxId + 1;

  await db.execute(
    sql.raw(`
      SELECT setval(pg_get_serial_sequence('${quotedModelName}', 'id'), ${nextId}, false)
    `)
  );

  console.log(`Reset sequence for ${modelName} to ${nextId}`);
}

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    return toPascalCase(path.basename(fileName, path.extname(fileName)));
  });

  for (const modelName of modelNames.reverse()) {
    const camelName = toCamelCase(modelName);
    const table = (schema as any)[camelName];
    if (!table) {
      console.error(`Table ${camelName} not found in schema`);
      continue;
    }

    try {
      await db.delete(table);
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData');

  const orderedFileNames = [
    'location.json',
    'manager.json',
    'property.json',
    'tenant.json',
    'lease.json',
    'application.json',
    'payment.json',
  ];

  // Delete all existing data
  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // ✅ Convert all ISO strings to real Date objects
    reviveDates(jsonData);

    const modelName = toPascalCase(path.basename(fileName, path.extname(fileName)));
    const modelNameCamel = toCamelCase(modelName);

    if (modelName === 'Location') {
      await insertLocationData(jsonData);
    } else {
      const table = (schema as any)[modelNameCamel];
      if (!table) {
        console.error(`Table ${modelNameCamel} not found in schema`);
        continue;
      }

      try {
        await db.insert(table).values(jsonData);
        console.log(`Seeded ${modelName} with data from ${fileName}`);
      } catch (error) {
        console.error(`Error seeding data for ${modelName}:`, error);
      }
    }

    await resetSequence(modelName);
    await sleep(1000);
  }

  await pool.end();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
