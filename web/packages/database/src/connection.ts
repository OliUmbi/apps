import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
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
	const configuredRoles = [
		decodeURIComponent(url.username),
		...url.searchParams.getAll("user"),
	];
	if (configuredRoles.some((role) => role && role !== options.role)) {
		throw new Error(`Database connection must authenticate as ${options.role}`);
	}
	const password =
		options.password?.() ??
		(url.password
			? decodeURIComponent(url.password)
			: url.searchParams.get("password"));
	url.username = options.role;
	if (password !== null && password !== undefined) url.password = password;
	url.searchParams.delete("user");
	url.searchParams.delete("password");
	url.searchParams.set("application_name", options.applicationName);
	return {
		connectionString: url.toString(),
		max: options.maxConnections ?? poolDefaults.connections,
		idleTimeoutMillis: poolDefaults.idleTimeoutSeconds * 1000,
		connectionTimeoutMillis: poolDefaults.connectTimeoutSeconds * 1000,
	};
}

export function createDatabasePool(options: DatabasePoolOptions): DatabasePool {
	let client: Database | undefined;
	let pool: Pool | undefined;
	function connection(): Database {
		if (client) return client;
		pool = new Pool(connectionOptions(options));
		pool.on("error", (error) => {
			console.error("Unexpected error on an idle database connection", error);
		});
		client = drizzle(pool);
		return client;
	}
	return {
		role: options.role,
		get db() {
			return connection();
		},
		transaction<T>(work: (transaction: Transaction) => Promise<T>) {
			return connection().transaction(work);
		},
		async close() {
			if (!pool) return;
			await pool.end();
			pool = undefined;
			client = undefined;
		},
	};
}
