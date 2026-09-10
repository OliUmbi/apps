import type { ResourceDefinition } from "@oliumbi/contracts";
import type { Database } from "./database.types";
import { createResourceReader } from "./resource-reader";
import { createResourceWriter } from "./resource-writer";
export function createResourceRepository(
	sql: Database,
	definition: ResourceDefinition,
) {
	return {
		...createResourceReader(sql, definition),
		...createResourceWriter(sql, definition),
	};
}
