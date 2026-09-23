import { type PageInput, pageResult } from "@oliumbi/contracts";
import type { PgSelect } from "drizzle-orm/pg-core";

export async function paginate<T extends PgSelect>(query: T, input: PageInput) {
	const rows = await query
		.limit(input.size + 1)
		.offset(input.page * input.size);
	return pageResult<T["_"]["result"][number]>(rows, input);
}

export function searchPattern(search: string): string {
	return `%${search.replace(/[\\%_]/g, "\\$&")}%`;
}
