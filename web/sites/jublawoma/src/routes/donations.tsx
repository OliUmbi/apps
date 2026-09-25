import { createFileRoute } from "@tanstack/react-router";
import { DonationCampaign } from "../components/donation-campaign";
import { NoCurrentDonations } from "../components/no-current-donations";
import { getCurrentDonation } from "../data/donations";

export const Route = createFileRoute("/donations")({
	loader: () => getCurrentDonation(),
	component: Donations,
});
function Donations() {
	const campaign = Route.useLoaderData();
	return campaign ? (
		<DonationCampaign key={campaign.id} campaign={campaign} />
	) : (
		<NoCurrentDonations />
	);
}
