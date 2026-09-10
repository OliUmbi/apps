import { createDatabasePool, databasePoolSize } from "@oliumbi/database";

export const database = createDatabasePool({
	role: "unclet",
	password: () => process.env.UNCLET_DATABASE_PASSWORD,
	applicationName: "unclet-web",
	connectionString: () => process.env.DATABASE_URL,
	maxConnections: databasePoolSize(process.env.DATABASE_POOL_SIZE),
});
