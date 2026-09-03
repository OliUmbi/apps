import { requireActor } from "../../server/auth.server";
import { findInquiries, setInquiryStatus } from "./inquiries.repository";
import type { InquiryStatus, UncleTInquiry } from "./inquiries.types";

export type { InquiryStatus, UncleTInquiry } from "./inquiries.types";
export { inquiryStatuses } from "./inquiries.types";

export async function listInquiries(): Promise<UncleTInquiry[]> {
	await requireActor();
	return findInquiries();
}

export async function updateInquiryStatus(id: string, status: InquiryStatus) {
	await requireActor();
	await setInquiryStatus(id, status, new Date());
}
