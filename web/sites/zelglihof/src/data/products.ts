import { publicImageUrl } from "@oliumbi/assets/urls";
import {
	idSchema,
	type Page,
	pageSchema,
	type ResourceRecord,
} from "@oliumbi/contracts";
import { createPublicRepository } from "@oliumbi/zelglihof-data";
import type { Product } from "@oliumbi/zelglihof-data/public.types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { database } from "../server/database.server";

function productFromRecord(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): Product {
	const active =
		(!record.starts_at || Date.parse(String(record.starts_at)) <= Date.now()) &&
		(!record.ends_at || Date.parse(String(record.ends_at)) >= Date.now());
	return {
		id: String(record.id),
		name: String(record.name),
		shortName: String(record.name),
		eyebrow: "Direkt ab Hof",
		description: String(record.description),
		longDescription: String(record.body),
		image: record.image_id ? publicImageUrl(String(record.image_id)) : "",
		availability:
			record.reservable && active ? "Reservation offen" : "Im Hofladen",
		kind: record.reservable && active ? "reservable" : "seasonal",
		variants: children.map((row) => ({
			id: String(row.id),
			name: String(row.name),
			price: String(row.price),
			description: String(row.description ?? ""),
			image: row.image_id ? publicImageUrl(String(row.image_id)) : "",
			quantity: row.quantity === null ? null : Number(row.quantity),
		})),
	};
}

export const getProductPage = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema.shape.page }))
	.handler(async ({ data }): Promise<Page<Product>> => {
		const result = await createPublicRepository(database.sql).list(
			"zelglihof.product",
			data.page,
		);
		return {
			...result,
			items: result.items.map((row) => productFromRecord(row)),
		};
	});

export const getProduct = createServerFn({ method: "GET" })
	.validator(z.object({ id: idSchema }))
	.handler(async ({ data }): Promise<Product | null> => {
		const result = await createPublicRepository(database.sql).detail(
			"zelglihof.product",
			data.id,
		);
		return result ? productFromRecord(result.record, result.children) : null;
	});
