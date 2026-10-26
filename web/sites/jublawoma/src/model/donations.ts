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
