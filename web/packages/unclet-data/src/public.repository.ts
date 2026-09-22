import { pageSchema } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createReviewRepository } from "./content/review.repository";
import { createShowcaseRepository } from "./content/showcase.repository";
import { createShowcaseImageRepository } from "./content/showcase-image.repository";

export function createPublicRepository(sql: SqlExecutor) {
	const showcases = createShowcaseRepository(sql).read;
	const images = createShowcaseImageRepository(sql).read;
	const reviews = createReviewRepository(sql).read;
	const published = sql`published = true AND published_on <= current_date`;
	return {
		listShowcases: (page: number) =>
			showcases.page(pageSchema.parse({ page }), published),
		async findShowcase(slug: string) {
			const showcase = await showcases.find(
				sql`slug = ${slug} AND ${published}`,
			);
			if (!showcase) return null;
			return {
				showcase,
				images: await images.all(
					sql`showcase_id = ${showcase.id}`,
					sql`created_at, image_id`,
				),
			};
		},
		listReviews: (page: number) =>
			reviews.page(pageSchema.parse({ page }), sql`visible = true`),
	};
}
