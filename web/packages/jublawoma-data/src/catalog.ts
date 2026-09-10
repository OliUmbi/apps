import type { ResourceDefinition } from "@oliumbi/contracts";
import * as jublawoma from "./resources";
export const resources = {
	"jublawoma.promotion": jublawoma.jublawomaPromotion,
	"jublawoma.story": jublawoma.jublawomaStory,
	"jublawoma.story_image": jublawoma.jublawomaStoryImage,
	"jublawoma.event": jublawoma.jublawomaEvent,
	"jublawoma.member": jublawoma.jublawomaMember,
	"jublawoma.donation": jublawoma.jublawomaDonation,
	"jublawoma.donation_item": jublawoma.jublawomaDonationItem,
	"jublawoma.donation_commitment": jublawoma.jublawomaDonationCommitment,
} satisfies Record<string, ResourceDefinition>;
export type ResourceId = keyof typeof resources;
export const resourceIds = Object.keys(resources) as [
	ResourceId,
	...ResourceId[],
];
export function getResource(id: ResourceId): ResourceDefinition {
	return resources[id];
}

export const publicResourceIds = [
	"jublawoma.promotion",
	"jublawoma.story",
	"jublawoma.event",
	"jublawoma.member",
	"jublawoma.donation",
] as const;
