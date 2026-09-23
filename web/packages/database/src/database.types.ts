import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export type Database = NodePgDatabase;
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
export type DatabaseExecutor = Database | Transaction;
export interface DatabasePoolOptions {
	applicationName: string;
	role: string;
	connectionString: () => string | undefined;
	password?: () => string | undefined;
	maxConnections?: number;
}
export interface DatabasePool {
	readonly role: string;
	readonly db: Database;
	transaction<T>(work: (transaction: Transaction) => Promise<T>): Promise<T>;
	close(): Promise<void>;
}
