import { pageSchema } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate } from "@oliumbi/database/pagination";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { createDonationReader } from "./donation.reader";
import {
	donation,
	event,
	member,
	promotion,
	story,
	storyImage,
} from "./schema";

export function createPublicRepository(db: DatabaseExecutor) {
	const published = and(
		eq(story.published, true),
		lte(story.publishedOn, sql`current_date`),
	);
	const activeDonation = and(
		lte(donation.startsAt, sql`now()`),
		gte(donation.endsAt, sql`now()`),
	);
	const upcoming = gte(event.endsOn, sql`current_date`);
	return {
		listStories(page: number) {
			return paginate(
				db
					.select()
					.from(story)
					.where(published)
					.orderBy(desc(story.createdAt), story.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		async findStory(slug: string) {
			const [record] = await db
				.select()
				.from(story)
				.where(and(eq(story.slug, slug), published))
				.limit(1);
			if (!record) return null;
			return {
				story: record,
				images: await db
					.select()
					.from(storyImage)
					.where(eq(storyImage.storyId, record.id))
					.orderBy(storyImage.createdAt, storyImage.imageId),
			};
		},
		listPromotions(page: number) {
			return paginate(
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
		listMembers(page: number) {
			return paginate(
				db
					.select()
					.from(member)
					.orderBy(desc(member.createdAt), member.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		leadership() {
			return db
				.select()
				.from(member)
				.where(eq(member.leadership, true))
				.orderBy(member.name, member.id);
		},
		listEvents(page: number) {
			return paginate(
				db
					.select()
					.from(event)
					.where(upcoming)
					.orderBy(event.startsOn, event.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		async nextEvent() {
			const [record] = await db
				.select()
				.from(event)
				.where(upcoming)
				.orderBy(event.startsOn, event.id)
				.limit(1);
			return record ?? null;
		},
		async currentDonation() {
			const [record] = await db
				.select()
				.from(donation)
				.where(activeDonation)
				.orderBy(desc(donation.createdAt), donation.id)
				.limit(1);
			return record
				? {
						donation: record,
						items: await createDonationReader(db).items(record.id),
					}
				: null;
		},
	};
}
