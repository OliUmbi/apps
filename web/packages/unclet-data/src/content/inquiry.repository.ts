import { guardRepository } from "@oliumbi/contracts";
import type { DatabaseExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { inquiry } from "../schema";
import type { Inquiry, InquiryInput, InquiryKey } from "./inquiry";

export function createInquiryRepository(db: DatabaseExecutor) {
	// No create: inquiry rows are written by the submission workflow and only
	// managed (status) from here.
	const store = createContentRepository<Inquiry, InquiryKey, InquiryInput>(db, {
		table: inquiry,
		name: "unclet.inquiry",
		key: { id: inquiry.id },
		search: inquiry.name,
		createdAt: inquiry.createdAt,
		updatedAt: inquiry.updatedAt,
	});
	return guardRepository({
		list: store.list,
		get: store.get,
		update: store.update,
		delete: store.delete,
	});
}
