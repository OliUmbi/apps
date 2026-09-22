import { idSchema, pageSchema } from "@oliumbi/contracts";
import { createServerFn } from "@tanstack/react-start";
import { donationCommitmentKeySchema } from "../../../model/content/jublawoma/donation-commitment";
import { requireActor } from "../../auth.server";
import { donationCommitmentStore } from "./donation-commitment.server";

export const listDonationCommitments = createServerFn({ method: "GET" })
	.validator(pageSchema.extend({ donationId: idSchema }))
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationCommitmentStore().list(data, {
			donation_id: data.donationId,
		});
	});

export const getDonationCommitment = createServerFn({ method: "GET" })
	.validator(donationCommitmentKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		return donationCommitmentStore().get(data);
	});

export const deleteDonationCommitment = createServerFn({ method: "POST" })
	.validator(donationCommitmentKeySchema)
	.handler(async ({ data }) => {
		await requireActor("jublawoma");
		await donationCommitmentStore().delete(data);
	});
