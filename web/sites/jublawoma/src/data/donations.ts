import { createPublicRepository } from "@oliumbi/jublawoma-data";
import { createDonationService } from "@oliumbi/jublawoma-data/donation.service";
import { commitmentSchema } from "@oliumbi/jublawoma-data/forms";
import { createServerFn } from "@tanstack/react-start";
import type { PublicDonationCampaign } from "../model/donations";
import { database } from "../server/database.server";

export const submitCommitment = createServerFn({ method: "POST" })
	.validator(commitmentSchema)
	.handler(async ({ data }) => {
		const result = await createDonationService(database).commit(data);
		// The public form keeps its coarse "unavailable" bucket: a missing item,
		// an inactive donation, and an oversold item all read the same to the
		// donor. Callers that can act on the cause use the service union directly.
		return result.outcome === "committed" ||
			result.outcome === "invalid-increment"
			? result
			: { outcome: "unavailable" as const };
	});
export const getCurrentDonation = createServerFn({ method: "GET" }).handler(
	async (): Promise<PublicDonationCampaign | null> => {
		const campaign = await createPublicRepository(
			database.db,
		).currentDonation();
		if (!campaign) return null;
		const { donation, items } = campaign;
		return {
			id: donation.id,
			title: donation.title,
			description: donation.description ?? "",
			startsAt: donation.startsAt,
			endsAt: donation.endsAt,
			contact: donation.contact,
			items: items.map((item) => ({
				id: item.id,
				name: item.name,
				description: item.detail ?? "",
				// Quantities stay decimal strings until this display boundary; the
				// view model rounds them for presentation only.
				quantity: Number(item.quantity),
				remaining: Number(item.remaining),
				step: Number(item.step),
				unit: item.unit,
			})),
		};
	},
);
