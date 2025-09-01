"use strict";
// server/seed.ts
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
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const drizzle_orm_1 = require("drizzle-orm");
const schema = __importStar(require("./schema")); // <-- update to your actual schema path
(0, dotenv_1.config)({ path: '.env' });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool, { schema });
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function toCamelCase(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}
// ✅ Utility to convert ISO date strings to real Date objects recursively
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
async function insertLocationData(locations) {
    for (const location of locations) {
        const { id, country, city, state, address, postalCode, coordinates } = location;
        try {
            await db.execute((0, drizzle_orm_1.sql) `INSERT INTO "Location" ("id", "country", "city", "state", "address", "postalCode", "coordinates")
            VALUES (${id}, ${country}, ${city}, ${state}, ${address}, ${postalCode}, ST_GeomFromText(${coordinates}, 4326))`);
            console.log(`Inserted location for ${city}`);
        }
        catch (error) {
            console.error(`Error inserting location for ${city}:`, error);
        }
    }
}
async function resetSequence(modelName) {
    const quotedModelName = `"${toPascalCase(modelName)}"`;
    const result = await db.execute(drizzle_orm_1.sql.raw(`SELECT MAX(id) as max_id FROM ${quotedModelName}`));
    const maxId = (result.rows?.[0]?.max_id ?? 0);
    const nextId = maxId + 1;
    await db.execute(drizzle_orm_1.sql.raw(`
      SELECT setval(pg_get_serial_sequence('${quotedModelName}', 'id'), ${nextId}, false)
    `));
    console.log(`Reset sequence for ${modelName} to ${nextId}`);
}
async function deleteAllData(orderedFileNames) {
    const modelNames = orderedFileNames.map((fileName) => {
        return toPascalCase(path_1.default.basename(fileName, path_1.default.extname(fileName)));
    });
    for (const modelName of modelNames.reverse()) {
        const camelName = toCamelCase(modelName);
        const table = schema[camelName];
        if (!table) {
            console.error(`Table ${camelName} not found in schema`);
            continue;
        }
        try {
            await db.delete(table);
            console.log(`Cleared data from ${modelName}`);
        }
        catch (error) {
            console.error(`Error clearing data from ${modelName}:`, error);
        }
    }
}
async function main() {
    const dataDirectory = path_1.default.join(__dirname, 'seedData');
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
        const filePath = path_1.default.join(dataDirectory, fileName);
        const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        // ✅ Convert all ISO strings to real Date objects
        reviveDates(jsonData);
        const modelName = toPascalCase(path_1.default.basename(fileName, path_1.default.extname(fileName)));
        const modelNameCamel = toCamelCase(modelName);
        if (modelName === 'Location') {
            await insertLocationData(jsonData);
        }
        else {
            const table = schema[modelNameCamel];
            if (!table) {
                console.error(`Table ${modelNameCamel} not found in schema`);
                continue;
            }
            try {
                await db.insert(table).values(jsonData);
                console.log(`Seeded ${modelName} with data from ${fileName}`);
            }
            catch (error) {
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
//# sourceMappingURL=seed.js.map