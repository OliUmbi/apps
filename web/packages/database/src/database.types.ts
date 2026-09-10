import type postgres from "postgres";
export type Database = ReturnType<typeof postgres>;
export type Transaction = postgres.TransactionSql;
export interface DatabasePoolOptions {
	applicationName: string;
	role: string;
	connectionString: () => string | undefined;
	password?: () => string | undefined;
	maxConnections?: number;
}
export interface DatabasePool {
	readonly role: string;
	readonly sql: Database;
	transaction<T>(work: (sql: Transaction) => Promise<T>): Promise<T>;
	close(): Promise<void>;
}
