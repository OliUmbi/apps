import { pageSchema } from "@oliumbi/contracts";
import type { SqlExecutor } from "@oliumbi/database";
import { createDonationRepository } from "./content/donation.repository";
import { createEventRepository } from "./content/event.repository";
import { createMemberRepository } from "./content/member.repository";
import { createPromotionRepository } from "./content/promotion.repository";
import { createStoryRepository } from "./content/story.repository";
import { createStoryImageRepository } from "./content/story-image.repository";
import { createDonationReader } from "./donation.reader";

export function createPublicRepository(sql: SqlExecutor) {
	const promotions = createPromotionRepository(sql).read;
	const stories = createStoryRepository(sql).read;
	const images = createStoryImageRepository(sql).read;
	const members = createMemberRepository(sql).read;
	const events = createEventRepository(sql).read;
	const donations = createDonationRepository(sql).read;
	const published = sql`published = true AND published_on <= current_date`;
	const active = sql`starts_at <= now() AND ends_at >= now()`;
	const upcoming = sql`ends_on >= current_date`;
	const eventOrder = sql`starts_on, id`;
	return {
		listPromotions: (page: number) =>
			promotions.page(pageSchema.parse({ page }), active),
		listStories: (page: number) =>
			stories.page(pageSchema.parse({ page }), published),
		async findStory(slug: string) {
			const story = await stories.find(sql`slug = ${slug} AND ${published}`);
			if (!story) return null;
			return {
				story,
				images: await images.all(
					sql`story_id = ${story.id}`,
					sql`created_at, image_id`,
				),
			};
		},
		listMembers: (page: number) =>
			members.page(pageSchema.parse({ page }), sql`true`),
		leadership: () => members.all(sql`leadership = true`, sql`name, id`),
		listEvents: (page: number) =>
			events.page(pageSchema.parse({ page }), upcoming, eventOrder),
		nextEvent: () => events.find(upcoming, eventOrder),
		async findDonation(id: string) {
			const donation = await donations.find(sql`id = ${id} AND ${active}`);
			return donation
				? {
						donation,
						items: await createDonationReader(sql).items(donation.id),
					}
				: null;
		},
		async currentDonation() {
			const donation = await donations.find(active);
			return donation
				? {
						donation,
						items: await createDonationReader(sql).items(donation.id),
					}
				: null;
		},
	};
}
