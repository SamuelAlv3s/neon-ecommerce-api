import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "dotenv";

if (process.env.NODE_ENV === "production") {
  config({ path: ".prod.env" });
} else {
  config({ path: ".dev.env" });
}
const pool = new Pool({
  connectionString: `${process.env.DATABASE_URL}`,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

export { db };
