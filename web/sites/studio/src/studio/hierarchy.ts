import type { ResourceId } from "./resources";

export interface ResourceRelation {
	resourceId: ResourceId;
	foreignKey: string;
	standalone?: boolean;
}

export const resourceRelations: Partial<
	Record<ResourceId, readonly ResourceRelation[]>
> = {
	"jublawoma.story": [
		{ resourceId: "jublawoma.story_image", foreignKey: "story_id" },
	],
	"jublawoma.donation": [
		{ resourceId: "jublawoma.donation_item", foreignKey: "donation_id" },
		{
			resourceId: "jublawoma.donation_commitment",
			foreignKey: "donation_id",
		},
	],
	"unclet.showcase": [
		{ resourceId: "unclet.showcase_image", foreignKey: "showcase_id" },
	],
	"zelglihof.article": [
		{ resourceId: "zelglihof.article_image", foreignKey: "article_id" },
	],
	"zelglihof.product": [
		{ resourceId: "zelglihof.product_variant", foreignKey: "product_id" },
		{
			resourceId: "zelglihof.product_reservation",
			foreignKey: "product_id",
			standalone: true,
		},
	],
};

const nestedOnlyResources = new Set<ResourceId>(
	Object.values(resourceRelations)
		.flat()
		.filter((relation) => !relation.standalone)
		.map((relation) => relation.resourceId),
);

export function isNestedOnlyResource(id: ResourceId): boolean {
	return nestedOnlyResources.has(id);
}

export function relationsFor(id: ResourceId): readonly ResourceRelation[] {
	return resourceRelations[id] ?? [];
}

export function isEditorialResource(id: ResourceId): boolean {
	return ["jublawoma.story", "unclet.showcase", "zelglihof.article"].includes(
		id,
	);
}
