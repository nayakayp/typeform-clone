import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For query purposes (with pool)
const client = postgres(connectionString, { max: 10 });
export const db = drizzle(client, { schema });

// For migrations (single connection)
export const migrationClient = postgres(connectionString, { max: 1 });

// Export schema for use in other parts of the app
export { schema };
