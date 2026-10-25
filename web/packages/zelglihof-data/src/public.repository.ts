import { type Page, pageSchema } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate } from "@oliumbi/database/pagination";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Article } from "./content/article";
import type { ArticleImage } from "./content/article-image";
import type { Product } from "./content/product";
import type { ProductVariant } from "./content/product-variant";
import type { Promotion } from "./content/promotion";
import {
	article,
	articleImage,
	product,
	productVariant,
	promotion,
} from "./schema";

export function createPublicRepository(db: DatabaseExecutor) {
	const published = and(
		eq(article.published, true),
		lte(article.publishedOn, sql`current_date`),
	);
	return {
		listArticles(page: number): Promise<Page<Article>> {
			return paginate<Article>(
				db
					.select()
					.from(article)
					.where(published)
					.orderBy(desc(article.createdAt), article.id)
					.$dynamic(),
				pageSchema.parse({ page }),
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
		listPromotions(page: number): Promise<Page<Promotion>> {
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
				pageSchema.parse({ page }),
			);
		},
		listProducts(page: number): Promise<Page<Product>> {
			return paginate<Product>(
				db
					.select()
					.from(product)
					.where(eq(product.visible, true))
					.orderBy(desc(product.createdAt), product.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		async findProduct(
			id: string,
		): Promise<{ product: Product; variants: ProductVariant[] } | null> {
			const [record] = await db
				.select()
				.from(product)
				.where(and(eq(product.id, id), eq(product.visible, true)))
				.limit(1);
			if (!record) return null;
			return {
				product: record,
				variants: await db
					.select()
					.from(productVariant)
					.where(eq(productVariant.productId, record.id))
					.orderBy(productVariant.createdAt, productVariant.id),
			};
		},
	};
}
