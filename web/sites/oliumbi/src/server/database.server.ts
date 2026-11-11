import { createDatabasePool, databasePoolSize } from "@oliumbi/database";

export const database = createDatabasePool({
	role: "oliumbi",
	password: () => process.env.OLIUMBI_DATABASE_PASSWORD,
	applicationName: "oliumbi-web",
	connectionString: () => process.env.DATABASE_URL,
	maxConnections: databasePoolSize(process.env.DATABASE_POOL_SIZE),
});
