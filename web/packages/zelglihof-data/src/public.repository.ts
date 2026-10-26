import { guardRepository, type Page, pageSchema } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate } from "@oliumbi/database/pagination";
import {
	and,
	desc,
	eq,
	getTableColumns,
	gte,
	inArray,
	lte,
	sql,
} from "drizzle-orm";
import type { Article } from "./content/article";
import type { ArticleImage } from "./content/article-image";
import type { Product } from "./content/product";
import type { Promotion } from "./content/promotion";
import { reservationWindowOpen } from "./reservation.repository";
import {
	type AvailableProduct,
	type AvailableVariant,
	productAvailability,
	variantStock,
} from "./reservation.types";
import {
	article,
	articleImage,
	product,
	productVariant,
	promotion,
} from "./schema";

// The public read model returns records with their availability already
// decided (state + catalog key). The policy lives in `reservation.types` and
// shares the write path's window predicate, so no caller re-derives it from
// raw timestamps or with its own clock.
function availableProduct(
	row: Product & { windowOpen: boolean },
	stock: readonly (number | null)[],
): AvailableProduct {
	const { windowOpen, ...record } = row;
	return {
		...record,
		availability: productAvailability({
			reservable: record.reservable,
			windowOpen,
			stock,
		}),
	};
}

async function stockByProduct(
	db: DatabaseExecutor,
	productIds: readonly string[],
): Promise<Map<string, (number | null)[]>> {
	if (productIds.length === 0) return new Map();
	const rows = await db
		.select({
			productId: productVariant.productId,
			quantity: productVariant.quantity,
		})
		.from(productVariant)
		.where(inArray(productVariant.productId, [...productIds]));
	const byProduct = new Map<string, (number | null)[]>();
	for (const row of rows) {
		const quantities = byProduct.get(row.productId) ?? [];
		quantities.push(row.quantity);
		byProduct.set(row.productId, quantities);
	}
	return byProduct;
}

export function createPublicRepository(db: DatabaseExecutor) {
	const published = and(
		eq(article.published, true),
		lte(article.publishedOn, sql`current_date`),
	);
	return guardRepository({
		listArticles(page: number, size?: number): Promise<Page<Article>> {
			return paginate<Article>(
				db
					.select()
					.from(article)
					.where(published)
					.orderBy(desc(article.createdAt), article.id)
					.$dynamic(),
				pageSchema.parse({ page, size }),
			);
		},
		async findArticle(
			slug: string,
		): Promise<{ article: Article; images: ArticleImage[] } | null> {
			const [record] = await db
				.select()
				.from(article)
				.where(and(eq(article.slug, slug), published))
				.limit(1);
			if (!record) return null;
			return {
				article: record,
				images: await db
					.select()
					.from(articleImage)
					.where(eq(articleImage.articleId, record.id))
					.orderBy(articleImage.createdAt, articleImage.imageId),
			};
		},
		listPromotions(page: number, size?: number): Promise<Page<Promotion>> {
			return paginate<Promotion>(
				db
					.select()
					.from(promotion)
					.where(
						and(
							lte(promotion.startsAt, sql`now()`),
							gte(promotion.endsAt, sql`now()`),
						),
					)
					.orderBy(desc(promotion.createdAt), promotion.id)
					.$dynamic(),
				pageSchema.parse({ page, size }),
			);
		},
		async listProducts(
			page: number,
			size?: number,
		): Promise<Page<AvailableProduct>> {
			const rows = await paginate<Product & { windowOpen: boolean }>(
				db
					.select({
						...getTableColumns(product),
						windowOpen: reservationWindowOpen,
					})
					.from(product)
					.where(eq(product.visible, true))
					.orderBy(desc(product.createdAt), product.id)
					.$dynamic(),
				pageSchema.parse({ page, size }),
			);
			const stock = await stockByProduct(
				db,
				rows.items.map((row) => row.id),
			);
			return {
				...rows,
				items: rows.items.map((row) =>
					availableProduct(row, stock.get(row.id) ?? []),
				),
			};
		},
		async findProduct(id: string): Promise<{
			product: AvailableProduct;
			variants: AvailableVariant[];
		} | null> {
			const [record] = await db
				.select({
					...getTableColumns(product),
					windowOpen: reservationWindowOpen,
				})
				.from(product)
				.where(and(eq(product.id, id), eq(product.visible, true)))
				.limit(1);
			if (!record) return null;
			const variants = await db
				.select()
				.from(productVariant)
				.where(eq(productVariant.productId, record.id))
				.orderBy(productVariant.createdAt, productVariant.id);
			return {
				product: availableProduct(
					record,
					variants.map((variant) => variant.quantity),
				),
				variants: variants.map((variant) => ({
					...variant,
					stock: variantStock(variant.quantity),
				})),
			};
		},
	});
}
