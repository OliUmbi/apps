import { pageSchema } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate } from "@oliumbi/database/pagination";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { review, showcase, showcaseImage } from "./schema";

export function createPublicRepository(db: DatabaseExecutor) {
	const published = and(
		eq(showcase.published, true),
		lte(showcase.publishedOn, sql`current_date`),
	);
	return {
		listShowcases(page: number) {
			return paginate(
				db
					.select()
					.from(showcase)
					.where(published)
					.orderBy(desc(showcase.createdAt), showcase.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		async findShowcase(slug: string) {
			const [record] = await db
				.select()
				.from(showcase)
				.where(and(eq(showcase.slug, slug), published))
				.limit(1);
			if (!record) return null;
			return {
				showcase: record,
				images: await db
					.select()
					.from(showcaseImage)
					.where(eq(showcaseImage.showcaseId, record.id))
					.orderBy(showcaseImage.createdAt, showcaseImage.imageId),
			};
		},
		listReviews(page: number) {
			return paginate(
				db
					.select()
					.from(review)
					.where(eq(review.visible, true))
					.orderBy(desc(review.createdAt), review.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
	};
}
