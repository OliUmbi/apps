import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { DonationCampaign } from "../components/donation-campaign";
import { NoCurrentDonations } from "../components/no-current-donations";
import { getCurrentDonation } from "../data/donations";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/donations")({
	loader: () => getCurrentDonation(),
	head: ({ loaderData }) =>
		loaderData
			? pageHead({
					title: loaderData.title,
					description: loaderData.description,
				})
			: pageHead({
					title: m.jublawoma_navigation_help(),
					description: m.jublawoma_donations_description(),
				}),
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
