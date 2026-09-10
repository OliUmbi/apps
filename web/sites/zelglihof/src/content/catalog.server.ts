import { imageUrl } from "@oliumbi/assets/urls";
import type { ResourceRecord } from "@oliumbi/contracts";
import { createContentRepository } from "@oliumbi/zelglihof-data";
import type { Product, Update } from "@oliumbi/zelglihof-data/content.types";
import { database } from "../server/database.server";

const assetUrl = (id: unknown) =>
	id
		? imageUrl(
				process.env.ASSETS_PUBLIC_URL ?? "http://localhost:8083",
				String(id),
			)
		: "";
function product(
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
		image: assetUrl(record.image_id),
		availability:
			record.reservable && active ? "Reservation offen" : "Im Hofladen",
		kind: record.reservable && active ? "reservable" : "seasonal",
		variants: children.map((row) => ({
			id: String(row.id),
			name: String(row.name),
			price: String(row.price),
			description: String(row.description ?? ""),
			image: assetUrl(row.image_id),
			quantity: row.quantity === null ? null : Number(row.quantity),
		})),
	};
}
function article(
	record: ResourceRecord,
	children: ResourceRecord[] = [],
): Update {
	return {
		id: String(record.id),
		slug: String(record.slug),
		title: String(record.title),
		description: String(record.description),
		body: String(record.body),
		image: assetUrl(record.image_id),
		date: String(record.published_on ?? "").slice(0, 10),
		category: "Vom Hof",
		images: children.map((row) => ({
			id: String(row.image_id),
			src: assetUrl(row.image_id),
			description: String(row.description),
		})),
	};
}
export async function productPage(page: number) {
	const result = await createContentRepository(database.sql).list(
		"zelglihof.product",
		page,
	);
	return { ...result, items: result.items.map((row) => product(row)) };
}
export async function articlePage(page: number) {
	const result = await createContentRepository(database.sql).list(
		"zelglihof.article",
		page,
	);
	return { ...result, items: result.items.map((row) => article(row)) };
}
export async function productDetail(id: string) {
	const result = await createContentRepository(database.sql).detail(
		"zelglihof.product",
		id,
	);
	return result ? product(result.record, result.children) : null;
}
export async function articleDetail(slug: string) {
	const result = await createContentRepository(database.sql).detail(
		"zelglihof.article",
		slug,
		true,
	);
	return result ? article(result.record, result.children) : null;
}
