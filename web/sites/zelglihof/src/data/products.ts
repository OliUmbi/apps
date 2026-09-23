import { publicImageUrl } from "@oliumbi/assets/urls";
import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/zelglihof-data";
import type { Product as ProductRecord } from "@oliumbi/zelglihof-data/content/product";
import type { ProductVariant } from "@oliumbi/zelglihof-data/content/product-variant";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Product } from "../model/content";
import { database } from "../server/database.server";

function productFromRecord(
	record: ProductRecord,
	variants: ProductVariant[] = [],
): Product {
	const now = Date.now();
	const active =
		(!record.startsAt || Date.parse(record.startsAt) <= now) &&
		(!record.endsAt || Date.parse(record.endsAt) >= now);
	return {
		id: record.id,
		name: record.name,
		shortName: record.name,
		eyebrow: "Direkt ab Hof",
		description: record.description,
		longDescription: record.body,
		image: record.imageId ? publicImageUrl(record.imageId) : "",
		availability:
			record.reservable && active ? "Reservation offen" : "Im Hofladen",
		kind: record.reservable && active ? "reservable" : "seasonal",
		variants: variants.map((variant) => ({
			id: variant.id,
			name: variant.name,
			price: variant.price,
			description: variant.description ?? "",
			image: variant.imageId ? publicImageUrl(variant.imageId) : "",
			quantity: variant.quantity,
		})),
	};
}
export const getProductPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }) => {
		const page = await createPublicRepository(database.db).listProducts(
			data.page,
		);
		return {
			...page,
			items: page.items.map((product) => productFromRecord(product)),
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
