export interface PublicDonationItem {
	id: string;
	name: string;
	description: string;
	quantity: number;
	remaining: number;
	step: number;
	unit: string;
}

export interface PublicDonationCampaign {
	id: string;
	title: string;
	description: string;
	startsAt: string;
	endsAt: string;
	contact: string;
	items: PublicDonationItem[];
}

export function roundQuantity(value: number): number {
	return Number(value.toPrecision(10));
}

export function formatDonationDates(start: string, end: string): string {
	const format = new Intl.DateTimeFormat("de-CH", {
		timeZone: "Europe/Zurich",
		day: "2-digit",
		month: "long",
		year: "numeric",
	});
	const first = new Date(start);
	const last = new Date(end);
	if (Number.isNaN(first.valueOf()) || Number.isNaN(last.valueOf())) return "";
	return `${format.format(first)} – ${format.format(last)}`;
}
