"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/database/testInsertManager.ts
const dotenv_1 = require("dotenv");
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const schema_1 = require("./schema"); // adjust if your schema path is different
(0, dotenv_1.config)({ path: ".env" });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const db = (0, node_postgres_1.drizzle)(pool);
/*async function main() {
  try {
    const newManagerData = {
      cognitoId: "test-cognito-id-123",
      name: "Test Manager",
      email: "test.manager@example.com",
      phoneNumber: "+1 (555) 000-1111",
    };

    console.log("Inserting manager:", newManagerData);

    const [insertedManager] = await db
      .insert(manager)
      .values(newManagerData)
      .returning();

    console.log("Manager inserted successfully:", insertedManager);
  } catch (err: any) {
    console.error("Error inserting manager:", err);
  } finally {
    await pool.end();
  }
}

main();
*/
const testConnection = async () => {
    const result = await db.select().from(schema_1.manager).limit(1);
    console.log("Test select:", result);
};
testConnection();
//# sourceMappingURL=testInsertManager.js.map