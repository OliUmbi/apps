import { idSchema, pageSchema } from "@oliumbi/contracts";
import { donationCommitmentKeySchema } from "@oliumbi/jublawoma-data/content/donation-commitment";
import { createDonationCommitmentRepository } from "@oliumbi/jublawoma-data/content/donation-commitment.repository";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../../database.server";
import { studioAuthorization } from "../../studio-authorization";

export const listDonationCommitments = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(pageSchema.extend({ donationId: idSchema.optional() }))
	.handler(async ({ data }) => {
		const repository = createDonationCommitmentRepository(database.db);
		return data.donationId
			? repository.listForDonation(data, data.donationId)
			: repository.list(data);
	});

export const getDonationCommitment = createServerFn({ method: "GET" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(donationCommitmentKeySchema)
	.handler(async ({ data }) => {
		return createDonationCommitmentRepository(database.db).get(data);
	});

export const deleteDonationCommitment = createServerFn({ method: "POST" })
	.middleware([studioAuthorization("jublawoma")])
	.validator(donationCommitmentKeySchema)
	.handler(async ({ data }) => {
		await createDonationCommitmentRepository(database.db).delete(data);
	});
