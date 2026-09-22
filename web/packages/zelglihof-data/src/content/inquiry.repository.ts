import type { SqlExecutor } from "@oliumbi/database";
import { createContentRepository } from "@oliumbi/database/content-repository";
import { type InquiryInput, type InquiryKey, inquirySchema } from "./inquiry";

export function createInquiryRepository(sql: SqlExecutor) {
	const repository = createContentRepository(sql, {
		table: "zelglihof.inquiry",
		selection: sql`id, status, name, phone, email, message, created_at AS "createdAt", updated_at AS "updatedAt"`,
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
