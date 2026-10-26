import { publicImageUrl } from "@oliumbi/assets/urls";
import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/zelglihof-data";
import type {
	AvailableProduct,
	AvailableVariant,
} from "@oliumbi/zelglihof-data/reservation.service";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Product, ProductSummary } from "../model/content";
import { database } from "../server/database.server";

function productSummaryFromRecord(record: AvailableProduct): ProductSummary {
	return {
		id: record.id,
		name: record.name,
		description: record.description,
		image: record.imageId ? publicImageUrl(record.imageId) : "",
		availability: record.availability,
		reservationOpen: record.availability.state === "reservation-open",
	};
}

function productFromRecord(
	record: AvailableProduct,
	variants: AvailableVariant[],
): Product {
	return {
		...productSummaryFromRecord(record),
		body: record.body,
		variants: variants.map((variant) => ({
			id: variant.id,
			name: variant.name,
			price: variant.price,
			description: variant.description ?? "",
			image: variant.imageId ? publicImageUrl(variant.imageId) : "",
			stock: variant.stock,
		})),
	};
}

const pageInput = z.object({
	page: pageSchema.shape.page,
	size: pageSchema.shape.size.optional(),
});

export const getProductPage = createServerFn({ method: "GET" })
	.validator(pageInput)
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listProducts(
			data.page,
			data.size,
		);
		return {
			...page,
			items: page.items.map(productSummaryFromRecord),
		};
	});
export const getProduct = createServerFn({ method: "GET" })
	.validator(z.object({ id: idSchema }))
	.handler(async ({ data }) => {
		const result = await createPublicRepository(database.db).findProduct(
			data.id,
		);
		return result ? productFromRecord(result.product, result.variants) : null;
	});
