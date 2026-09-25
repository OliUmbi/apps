import { createPublicRepository } from "@oliumbi/jublawoma-data";
import { commitmentSchema } from "@oliumbi/jublawoma-data/contracts";
import { createDonationService } from "@oliumbi/jublawoma-data/donation.service";
import { createServerFn } from "@tanstack/react-start";
import type { PublicDonationCampaign } from "../model/donations";
import { database } from "../server/database.server";

export const submitCommitment = createServerFn({ method: "POST" })
	.validator(commitmentSchema)
	.handler(({ data }) => createDonationService(database).commit(data));
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
				quantity: item.quantity,
				remaining: item.remaining,
				step: item.step,
				unit: item.unit,
			})),
		};
	},
);
