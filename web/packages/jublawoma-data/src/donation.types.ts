export interface DonationItem {
	title: string;
	name: string;
	detail: string | null;
	quantity: number;
	step: number;
	unit: string;
	active: boolean;
}
