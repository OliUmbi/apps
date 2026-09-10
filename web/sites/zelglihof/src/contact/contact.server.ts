import type { ContactInput } from "@oliumbi/zelglihof-data/contracts";
import { createInquiryService } from "@oliumbi/zelglihof-data/inquiry.service";
import { database } from "../server/database.server";
export function saveContactInquiry(input: ContactInput) {
	return createInquiryService(
		database,
		process.env.ZELGLIHOF_OWNER_EMAIL ?? "hof@zelglihof.ch",
	).submit(input);
}
