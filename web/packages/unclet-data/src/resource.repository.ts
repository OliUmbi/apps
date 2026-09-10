import type { Database } from "@oliumbi/database";
import { createResourceRepository as createRepository } from "@oliumbi/database/resource.repository";
import { getResource, type ResourceId } from "./catalog";
export function createResourceRepository(sql: Database, id: ResourceId) {
	return createRepository(sql, getResource(id));
}
