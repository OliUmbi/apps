import {
	idSchema,
	type ResourceRecord,
	resourceSchema,
	type SiteId,
} from "@oliumbi/contracts";
import type { Database } from "@oliumbi/database";
import { getResource, type ResourceId } from "../studio/resources";
import { validateImages } from "./assets.server";
import { siteRepository } from "./site-repositories";

export function createResourceService(sql: Database, id: ResourceId) {
	const resource = getResource(id);
	const repository = siteRepository(sql, id);
	function key(input: ResourceRecord) {
		return Object.fromEntries(
			(resource.keys ?? ["id"]).map((name) => [
				name,
				idSchema.parse(input[name]),
			]),
		);
	}
	return {
		list: repository.list,
		listRelated: repository.listRelated,
		find: repository.find,
		findBySlug: repository.findBySlug,
		async create(input: ResourceRecord) {
			if (!resource.create) throw new Error("Creation is not supported");
			const values = resourceSchema(resource).parse(input) as ResourceRecord;
			await validateImages(id.split(".")[0] as SiteId, values);
			return repository.create({
				...resource.createDefaults,
				...values,
			} as ResourceRecord);
		},
		async update(identity: ResourceRecord, input: ResourceRecord) {
			if (!resource.edit) throw new Error("Editing is not supported");
			const values = resourceSchema(resource).parse(input) as ResourceRecord;
			await validateImages(id.split(".")[0] as SiteId, values);
			return repository.update(key(identity), values);
		},
		async delete(identity: ResourceRecord) {
			if (!resource.delete) throw new Error("Deletion is not supported");
			await repository.delete(key(identity));
		},
	};
}
