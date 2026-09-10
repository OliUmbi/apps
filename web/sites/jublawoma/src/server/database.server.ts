import { createDatabasePool, databasePoolSize } from "@oliumbi/database";

export const database = createDatabasePool({
	role: "jublawoma",
	password: () => process.env.JUBLAWOMA_DATABASE_PASSWORD,
	applicationName: "jublawoma-web",
	connectionString: () => process.env.DATABASE_URL,
	maxConnections: databasePoolSize(process.env.DATABASE_POOL_SIZE),
});
