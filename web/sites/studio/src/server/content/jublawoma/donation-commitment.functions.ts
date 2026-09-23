import { idSchema, pageSchema } from "@oliumbi/contracts";
import { donationCommitmentKeySchema } from "@oliumbi/jublawoma-data/content/donation-commitment";
import { createDonationCommitmentRepository } from "@oliumbi/jublawoma-data/content/donation-commitment.repository";
import { createServerFn } from "@tanstack/react-start";
import { requireActor } from "../../auth.server";
import { database } from "../../database.server";

export const listDonationCommitments = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ donationId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationCommitmentRepository(database.db).listForDonation(
			data,
			data.donationId,
		);
	});

export const getDonationCommitment = createServerFn({ method: "GET" })
	.validator(donationCommitmentKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return createDonationCommitmentRepository(database.db).get(data);
	});

export const deleteDonationCommitment = createServerFn({ method: "POST" })
	.validator(donationCommitmentKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await createDonationCommitmentRepository(database.db).delete(data);
	});
