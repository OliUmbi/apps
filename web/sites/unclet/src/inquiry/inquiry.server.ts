import type { InquiryInput } from "@oliumbi/unclet-data/contracts";
import { createInquiryService } from "@oliumbi/unclet-data/inquiry.service";
import { database } from "../server/database.server";
export function saveInquiry(input: InquiryInput) {
	return createInquiryService(
		database,
		process.env.UNCLET_OWNER_EMAIL ?? "info@uncle-t.ch",
	).submit(input);
}
