import { type Page, type PageInput, pageResult } from "@oliumbi/contracts";
import type { PgSelect } from "drizzle-orm/pg-core";

/*
 * The caller names the row type: `Page<Row>` is the package's deliberate record
 * contract, not a derivation from the query builder's internal result type. The
 * repositories that call `paginate` annotate their return types, so their rows
 * are checked against `Row` where they read or write a record.
 */
export async function paginate<Row>(
	query: PgSelect,
	input: PageInput,
): Promise<Page<Row>> {
	const rows = (await query
		.limit(input.size + 1)
		.offset(input.page * input.size)) as unknown as Row[];
	return pageResult(rows, input);
}

export function searchPattern(search: string): string {
	return `%${search.replace(/[\\%_]/g, "\\$&")}%`;
}
