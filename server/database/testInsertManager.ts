// server/database/testInsertManager.ts
import { config } from "dotenv";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { manager } from "./schema"; // adjust if your schema path is different


config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

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
  const result = await db.select().from(manager).limit(1);
  console.log("Test select:", result);
};

testConnection();