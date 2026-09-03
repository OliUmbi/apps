export const inquiryStatuses = [
	"new",
	"contacted",
	"quoted",
	"confirmed",
	"closed",
	"declined",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];

export interface UncleTInquiry {
	id: string;
	customerName: string;
	email: string | null;
	phone: string | null;
	eventDate: string | null;
	location: string;
	guestCount: number;
	note: string | null;
	status: InquiryStatus;
	createdAt: string;
	updatedAt: string;
}
