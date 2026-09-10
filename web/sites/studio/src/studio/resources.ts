import type { ResourceDefinition } from "@oliumbi/contracts";
import * as jublawoma from "@oliumbi/jublawoma-data/resources";
import * as unclet from "@oliumbi/unclet-data/resources";
import * as zelglihof from "@oliumbi/zelglihof-data/resources";
import { fieldLabel } from "./field-labels";

export const resources = {
	"jublawoma.promotion": jublawoma.jublawomaPromotion,
	"jublawoma.story": jublawoma.jublawomaStory,
	"jublawoma.story_image": jublawoma.jublawomaStoryImage,
	"jublawoma.event": jublawoma.jublawomaEvent,
	"jublawoma.member": jublawoma.jublawomaMember,
	"jublawoma.donation": jublawoma.jublawomaDonation,
	"jublawoma.donation_item": jublawoma.jublawomaDonationItem,
	"jublawoma.donation_commitment": jublawoma.jublawomaDonationCommitment,
	"unclet.showcase": unclet.uncletShowcase,
	"unclet.showcase_image": unclet.uncletShowcaseImage,
	"unclet.review": unclet.uncletReview,
	"unclet.inquiry": unclet.uncletInquiry,
	"zelglihof.promotion": zelglihof.zelglihofPromotion,
	"zelglihof.article": zelglihof.zelglihofArticle,
	"zelglihof.article_image": zelglihof.zelglihofArticleImage,
	"zelglihof.product": zelglihof.zelglihofProduct,
	"zelglihof.product_variant": zelglihof.zelglihofProductVariant,
	"zelglihof.product_reservation": zelglihof.zelglihofProductReservation,
	"zelglihof.subscriber": zelglihof.zelglihofSubscriber,
	"zelglihof.campaign": zelglihof.zelglihofCampaign,
	"zelglihof.inquiry": zelglihof.zelglihofInquiry,
} satisfies Record<string, ResourceDefinition>;
export type ResourceId = keyof typeof resources;
export const resourceIds = Object.keys(resources) as [
	ResourceId,
	...ResourceId[],
];
export function getResource(id: ResourceId): ResourceDefinition {
	const resource = resources[id];
	return {
		...resource,
		fields: resource.fields.map((field) => ({
			...field,
			label: fieldLabel(field.name, field.label),
		})),
	};
}
