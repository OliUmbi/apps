import { createFileRoute } from "@tanstack/react-router";
import { DonationCampaign } from "../components/donation-campaign";
import { NoCurrentDonations } from "../components/no-current-donations";
import { getDonation } from "../data/donations";
import { listPublicRecords } from "../data/public-records";

export const Route = createFileRoute("/donations")({
	loader: async () => {
		const page = await listPublicRecords({
			data: { resource: "jublawoma.donation", page: 0 },
		});
		const active = page.items[0];
		return active ? getDonation({ data: String(active.id) }) : null;
	},
	component: Donations,
});
function Donations() {
	const campaign = Route.useLoaderData();
	return campaign ? (
		<DonationCampaign record={campaign.record} items={campaign.children} />
	) : (
		<NoCurrentDonations />
	);
}
