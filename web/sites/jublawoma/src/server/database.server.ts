import { createDatabasePool, databasePoolSize } from "@oliumbi/database";

export const database = createDatabasePool({
	applicationName: "jublawoma-web",
	connectionString: () => process.env.DATABASE_URL,
	maxConnections: databasePoolSize(process.env.DATABASE_POOL_SIZE),
});
