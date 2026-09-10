import { idSchema } from "@oliumbi/contracts";
import { createContentRepository } from "@oliumbi/jublawoma-data";
import { commitmentSchema } from "@oliumbi/jublawoma-data/contracts";
import { createDonationService } from "@oliumbi/jublawoma-data/donation.service";
import { createDonationReader } from "@oliumbi/jublawoma-data/donation-reader";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";
export const submitCommitment = createServerFn({ method: "POST" })
	.validator(commitmentSchema)
	.handler(({ data }) => createDonationService(database).commit(data));

export const getDonation = createServerFn({ method: "GET" })
	.validator(idSchema)
	.handler(async ({ data }) => {
		const result = await createContentRepository(database.sql).detail(
			"jublawoma.donation",
			data,
		);
		if (!result) return null;
		return {
			record: result.record,
			children: await createDonationReader(database.sql).items(data),
		};
	});
