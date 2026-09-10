import type { ResourceDefinition } from "@oliumbi/contracts";
import * as unclet from "./resources";
export const resources = {
	"unclet.showcase": unclet.uncletShowcase,
	"unclet.showcase_image": unclet.uncletShowcaseImage,
	"unclet.review": unclet.uncletReview,
	"unclet.inquiry": unclet.uncletInquiry,
} satisfies Record<string, ResourceDefinition>;
export type ResourceId = keyof typeof resources;
export const resourceIds = Object.keys(resources) as [
	ResourceId,
	...ResourceId[],
];
export function getResource(id: ResourceId): ResourceDefinition {
	return resources[id];
}

export const publicResourceIds = ["unclet.showcase", "unclet.review"] as const;
