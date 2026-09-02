import postgres from "postgres";

export type Database = ReturnType<typeof postgres>;

const clients = new Map<string, Database>();

export function getDatabase(connectionString: string | undefined): Database {
	if (!connectionString) {
		throw new Error("DATABASE_URL is not configured");
	}

	const existing = clients.get(connectionString);
	if (existing) return existing;

	const client = postgres(connectionString, {
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10,
		prepare: true,
	});
	clients.set(connectionString, client);
	return client;
}

export async function closeDatabases(): Promise<void> {
	await Promise.all([...clients.values()].map((client) => client.end()));
	clients.clear();
}

export function exactlyOne<T>(rows: readonly T[], context: string): T {
	if (rows.length !== 1) {
		throw new Error(
			`${context}: expected exactly one row, received ${rows.length}`,
		);
	}
	return rows[0];
}
