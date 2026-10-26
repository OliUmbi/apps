import { guardRepository, type Page, pageSchema } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate } from "@oliumbi/database/pagination";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import type { Review } from "./content/review";
import type { Showcase } from "./content/showcase";
import type { ShowcaseImage } from "./content/showcase-image";
import { review, showcase, showcaseImage } from "./schema";

// Teaser payload for the showcase list: summary fields plus a bounded plain-text
// excerpt. The markdown body stays out of the list payload; only findShowcase
// returns the full record (D4).
export interface ShowcaseListItem {
	id: string;
	slug: string;
	title: string;
	location: string;
	guestCount: number;
	imageId: string | null;
	excerpt: string;
}

// Bounded markdown slice selected with the summary row: enough source for a
// readable excerpt without shipping the body column over the wire.
const excerptSourceLimit = 800;
const excerptLength = 240;

// Plain-text excerpt of a markdown body: markup markers are stripped so the
// teaser can render the text as-is, and the result is length-bounded at a word
// boundary (D4).
export function showcaseExcerpt(markdown: string): string {
	const text = markdown
		.replace(/```[\s\S]*?(```|$)/g, " ")
		.replace(/!\[[^\]]*]\([^)]*\)/g, " ")
		.replace(/\[([^\]]*)]\([^)]*\)/g, "$1")
		.replace(/^\s{0,3}#{1,6}\s+/gm, "")
		.replace(/^\s{0,3}[-*+]\s+/gm, "")
		.replace(/^\s{0,3}>\s+/gm, "")
		.replace(/[*_`~]/g, "")
		.replace(/\s+/g, " ")
		.trim();
	if (text.length <= excerptLength) return text;
	const cut = text.slice(0, excerptLength);
	const boundary = cut.lastIndexOf(" ");
	return `${(boundary > excerptLength / 2 ? cut.slice(0, boundary) : cut).trimEnd()}…`;
}

interface ShowcaseListRow {
	id: string;
	slug: string;
	title: string;
	location: string;
	guestCount: number;
	imageId: string | null;
	excerptSource: string;
}

export function createPublicRepository(db: DatabaseExecutor) {
	const published = and(
		eq(showcase.published, true),
		lte(showcase.publishedOn, sql`current_date`),
	);
	return guardRepository({
		async listShowcases(page: number): Promise<Page<ShowcaseListItem>> {
			const result = await paginate<ShowcaseListRow>(
				db
					.select({
						id: showcase.id,
						slug: showcase.slug,
						title: showcase.title,
						location: showcase.location,
						guestCount: showcase.guestCount,
						imageId: showcase.imageId,
						excerptSource: sql<string>`left(coalesce(${showcase.body}, ''), ${sql.raw(String(excerptSourceLimit))})`,
					})
					.from(showcase)
					.where(published)
					.orderBy(desc(showcase.createdAt), showcase.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
			return {
				...result,
				items: result.items.map((row) => ({
					id: row.id,
					slug: row.slug,
					title: row.title,
					location: row.location,
					guestCount: row.guestCount,
					imageId: row.imageId,
					excerpt: showcaseExcerpt(row.excerptSource),
				})),
			};
		},
		async findShowcase(
			slug: string,
		): Promise<{ showcase: Showcase; images: ShowcaseImage[] } | null> {
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
		listReviews(page: number): Promise<Page<Review>> {
			return paginate<Review>(
				db
					.select()
					.from(review)
					.where(eq(review.visible, true))
					.orderBy(desc(review.createdAt), review.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
	});
}
