import { type Page, pageSchema } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { paginate } from "@oliumbi/database/pagination";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import type { Donation } from "./content/donation";
import type { Event } from "./content/event";
import type { Member } from "./content/member";
import type { Promotion } from "./content/promotion";
import type { Story } from "./content/story";
import type { StoryImage } from "./content/story-image";
import { createDonationReader } from "./donation.reader";
import type { DonationItemAvailability } from "./donation.types";
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
	// Events that have not ended: a single-day event counts as running on its
	// day, so "upcoming" alone would be the wrong name for this predicate.
	const runningOrUpcoming = gte(event.endsOn, sql`current_date`);
	return {
		listStories(page: number): Promise<Page<Story>> {
			return paginate<Story>(
				db
					.select()
					.from(story)
					.where(published)
					.orderBy(desc(story.createdAt), story.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		async findStory(
			slug: string,
		): Promise<{ story: Story; images: StoryImage[] } | null> {
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
		listMembers(page: number): Promise<Page<Member>> {
			return paginate<Member>(
				db
					.select()
					.from(member)
					.orderBy(desc(member.createdAt), member.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		leadership(): Promise<Member[]> {
			return db
				.select()
				.from(member)
				.where(eq(member.leadership, true))
				.orderBy(member.name, member.id);
		},
		listEvents(page: number): Promise<Page<Event>> {
			return paginate<Event>(
				db
					.select()
					.from(event)
					.where(runningOrUpcoming)
					.orderBy(event.startsOn, event.id)
					.$dynamic(),
				pageSchema.parse({ page }),
			);
		},
		async nextEvent(): Promise<Event | null> {
			const [record] = await db
				.select()
				.from(event)
				.where(runningOrUpcoming)
				.orderBy(event.startsOn, event.id)
				.limit(1);
			return record ?? null;
		},
		async currentDonation(): Promise<{
			donation: Donation;
			items: DonationItemAvailability[];
		} | null> {
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
