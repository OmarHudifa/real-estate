"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/database/seed.ts
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("./schema"));
(0, dotenv_1.config)({ path: '.env' });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool, { schema });
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
// Convert ISO strings to Date objects
function reviveDates(obj) {
    if (Array.isArray(obj)) {
        obj.forEach(reviveDates);
    }
    else if (obj && typeof obj === 'object') {
        for (const key in obj) {
            const val = obj[key];
            if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
                obj[key] = new Date(val);
            }
            else if (typeof val === 'object') {
                reviveDates(val);
            }
        }
    }
}
// Reset sequences for serial IDs
async function resetSequence(tableName) {
    // Only reset sequence if the table has an 'id' column
    const skipTables = ['tenantProperties', 'tenantFavorites']; // junction tables
    if (skipTables.includes(tableName))
        return;
    const quotedName = `"${tableName}"`;
    const result = await db.execute(drizzle_orm_1.sql.raw(`SELECT MAX(id) as max_id FROM ${quotedName}`));
    const maxId = (result.rows?.[0]?.max_id ?? 0);
    const nextId = maxId + 1;
    await db.execute(drizzle_orm_1.sql.raw(`SELECT setval(pg_get_serial_sequence('${quotedName}', 'id'), ${nextId}, false)`));
    console.log(`Reset sequence for ${tableName} to ${nextId}`);
}
// Delete all table data
async function clearTables(tableNames) {
    for (const table of tableNames) {
        const tbl = schema[table];
        if (!tbl) {
            console.warn(`Table ${table} not found in schema`);
            continue;
        }
        try {
            await db.delete(tbl);
            console.log(`Cleared data from ${table}`);
        }
        catch (err) {
            console.error(`Error clearing data from ${table}:`, err);
        }
    }
}
// Load JSON from file
function loadJson(filePath) {
    return JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
}
async function main() {
    const dataDir = path_1.default.join(__dirname, 'seedData');
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
        const filePath = path_1.default.join(dataDir, fileName);
        if (!fs_1.default.existsSync(filePath)) {
            console.warn(`Seed file not found for table ${table}: ${filePath}`);
            continue;
        }
        let data = loadJson(filePath);
        reviveDates(data);
        // Special handling for location coordinates (PostGIS)
        if (table === 'location') {
            for (const loc of data) {
                try {
                    await db.execute((0, drizzle_orm_1.sql) `INSERT INTO "location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
                VALUES (${loc.id}, ${loc.country}, ${loc.city}, ${loc.state}, ${loc.address}, ${loc.postalCode}, ${loc.coordinates})`);
                }
                catch (err) {
                    console.error(`Error inserting location ${loc.city}:`, err);
                }
            }
        }
        else {
            const tbl = schema[toCamelCase(table)];
            if (!tbl)
                continue;
            try {
                await db.insert(tbl).values(data);
                console.log(`Seeded ${table}`);
            }
            catch (err) {
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
//# sourceMappingURL=seed.js.map