import { pageSchema } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createArticleRepository } from "./content/article.repository";
import { createArticleImageRepository } from "./content/article-image.repository";
import { createProductRepository } from "./content/product.repository";
import { createProductVariantRepository } from "./content/product-variant.repository";
import { createPromotionRepository } from "./content/promotion.repository";

export function createPublicRepository(sql: SqlExecutor) {
	const promotions = createPromotionRepository(sql).read;
	const articles = createArticleRepository(sql).read;
	const images = createArticleImageRepository(sql).read;
	const products = createProductRepository(sql).read;
	const variants = createProductVariantRepository(sql).read;
	const published = sql`published = true AND published_on <= current_date`;
	return {
		listPromotions: (page: number) =>
			promotions.page(
				pageSchema.parse({ page }),
				sql`starts_at <= now() AND ends_at >= now()`,
			),
		listArticles: (page: number) =>
			articles.page(pageSchema.parse({ page }), published),
		async findArticle(slug: string) {
			const article = await articles.find(sql`slug = ${slug} AND ${published}`);
			if (!article) return null;
			return {
				article,
				images: await images.all(
					sql`article_id = ${article.id}`,
					sql`created_at, image_id`,
				),
			};
		},
		listProducts: (page: number) =>
			products.page(pageSchema.parse({ page }), sql`visible = true`),
		async findProduct(id: string) {
			const product = await products.find(sql`id = ${id} AND visible = true`);
			if (!product) return null;
			return {
				product,
				variants: await variants.all(
					sql`product_id = ${product.id}`,
					sql`created_at, id`,
				),
			};
		},
	};
}
