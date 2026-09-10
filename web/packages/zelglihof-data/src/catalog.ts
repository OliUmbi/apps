import type { ResourceDefinition } from "@oliumbi/contracts";
import * as zelglihof from "./resources";
export const resources = {
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
	return resources[id];
}

export const publicResourceIds = [
	"zelglihof.promotion",
	"zelglihof.article",
	"zelglihof.product",
] as const;
