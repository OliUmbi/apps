import { createDatabasePool, databasePoolSize } from "@oliumbi/database";

export const database = createDatabasePool({
	role: "studio",
	password: () => process.env.STUDIO_DATABASE_PASSWORD,
	applicationName: "studio-web",
	connectionString: () => process.env.DATABASE_URL,
	maxConnections: databasePoolSize(process.env.DATABASE_POOL_SIZE),
});
