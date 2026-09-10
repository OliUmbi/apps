import postgres from "postgres";
import type {
	Database,
	DatabasePool,
	DatabasePoolOptions,
	Transaction,
} from "./database.types";

export const poolDefaults = {
	connections: 10,
	maximumConnections: 50,
	idleTimeoutSeconds: 20,
	connectTimeoutSeconds: 10,
} as const;

export function databasePoolSize(value: string | undefined): number {
	if (!value) return poolDefaults.connections;
	const size = Number(value);
	if (
		!Number.isInteger(size) ||
		size < 1 ||
		size > poolDefaults.maximumConnections
	) {
		throw new Error(
			`DATABASE_POOL_SIZE must be an integer between 1 and ${poolDefaults.maximumConnections}`,
		);
	}
	return size;
}

export function connectionOptions(options: DatabasePoolOptions) {
	const connectionString = options.connectionString();
	if (!connectionString) throw new Error("DATABASE_URL is not configured");
	const url = new URL(connectionString);
	const configuredRole = decodeURIComponent(url.username);
	if (configuredRole && configuredRole !== options.role) {
		throw new Error(`Database connection must authenticate as ${options.role}`);
	}
	return {
		url: connectionString,
		username: options.role,
		password:
			options.password?.() ??
			(url.password ? decodeURIComponent(url.password) : undefined),
	};
}

export function createDatabasePool(options: DatabasePoolOptions): DatabasePool {
	let client: Database | undefined;
	function connection(): Database {
		if (client) return client;
		const { url, username, password } = connectionOptions(options);
		client = postgres(url, {
			username,
			password,
			max: options.maxConnections ?? poolDefaults.connections,
			idle_timeout: poolDefaults.idleTimeoutSeconds,
			connect_timeout: poolDefaults.connectTimeoutSeconds,
			prepare: true,
			connection: { application_name: options.applicationName },
		});
		return client;
	}
	return {
		role: options.role,
		get sql() {
			return connection();
		},
		transaction<T>(work: (sql: Transaction) => Promise<T>) {
			return connection().begin(work) as Promise<T>;
		},
		async close() {
			if (!client) return;
			await client.end();
			client = undefined;
		},
	};
}
