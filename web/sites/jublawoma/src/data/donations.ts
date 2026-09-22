import { createPublicRepository } from "@oliumbi/jublawoma-data";
import { commitmentSchema } from "@oliumbi/jublawoma-data/contracts";
import { createDonationService } from "@oliumbi/jublawoma-data/donation.service";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export const submitCommitment = createServerFn({ method: "POST" })
	.validator(commitmentSchema)
	.handler(({ data }) => createDonationService(database).commit(data));
export const getCurrentDonation = createServerFn({ method: "GET" }).handler(
	() => createPublicRepository(database.sql).currentDonation(),
);
