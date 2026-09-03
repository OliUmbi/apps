import postgres from "postgres";

export type Database = ReturnType<typeof postgres>;
export type Transaction = postgres.TransactionSql;

export interface DatabasePoolOptions {
	applicationName: string;
	connectionString: () => string | undefined;
	maxConnections?: number;
}

export interface DatabasePool {
	readonly sql: Database;
	transaction<T>(work: (sql: Transaction) => Promise<T>): Promise<T>;
	close(): Promise<void>;
}

export function createDatabasePool(options: DatabasePoolOptions): DatabasePool {
	let client: Database | undefined;

	function connection(): Database {
		if (client) return client;
		const connectionString = options.connectionString();
		if (!connectionString) throw new Error("DATABASE_URL is not configured");

		client = postgres(connectionString, {
			max: options.maxConnections ?? 10,
			idle_timeout: 20,
			connect_timeout: 10,
			prepare: true,
			connection: { application_name: options.applicationName },
		});
		return client;
	}

	return {
		get sql() {
			return connection();
		},
		async transaction<T>(work: (sql: Transaction) => Promise<T>) {
			return connection().begin(work) as Promise<T>;
		},
		async close() {
			if (!client) return;
			await client.end();
			client = undefined;
		},
	};
}

export function databasePoolSize(value: string | undefined): number {
	if (!value) return 10;
	const size = Number.parseInt(value, 10);
	if (!Number.isInteger(size) || size < 1 || size > 50) {
		throw new Error("DATABASE_POOL_SIZE must be an integer between 1 and 50");
	}
	return size;
}

export function exactlyOne<T>(rows: readonly T[], context: string): T {
	if (rows.length !== 1) {
		throw new Error(
			`${context}: expected exactly one row, received ${rows.length}`,
		);
	}
	return rows[0];
}
