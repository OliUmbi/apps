import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type InquiryInput, type InquiryKey, inquirySchema } from "./inquiry";

export function createInquiryRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "unclet.inquiry",
		selection: sql`id, status, name, email, phone, event_on AS "eventOn", location, guest_count AS "guestCount", note, created_at AS "createdAt", updated_at AS "updatedAt"`,
		schema: inquirySchema,
		keyColumns: (key: InquiryKey) => ({ id: key.id }),
		orderColumns: ["id"],
		searchColumn: "name",
		writeColumns: (input: InquiryInput) => ({
			status: input.status,
		}),
	});
	return {
		read: repository.read,
		list: repository.list,
		get: repository.get,
		update: repository.update,
		delete: repository.delete,
	};
}
