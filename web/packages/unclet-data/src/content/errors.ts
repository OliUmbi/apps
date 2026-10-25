// A key/values mismatch is a caller error, never a silent re-parenting: updates
// address one row by its key and never rewrite identity columns.
export class RecordKeyMismatchError extends Error {
	readonly table: string;

	constructor(table: string) {
		super(`Key does not match the identity columns of ${table}`);
		this.name = "RecordKeyMismatchError";
		this.table = table;
	}
}
