import type { Database, Transaction } from "@oliumbi/database";
import {
	type InquiryInput,
	type InquiryKey,
	inquirySchema,
} from "../../../model/content/zelglihof/inquiry";
import { createContentStore } from "../../content-store.server";
import { database } from "../../database.server";

export function inquiryStore(sql: Database | Transaction = database.sql) {
	return createContentStore(sql, {
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
}
