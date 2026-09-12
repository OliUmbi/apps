import { createFileRoute, notFound } from "@tanstack/react-router";
import { DonationCampaign } from "../../components/donation-campaign";
import { getDonation } from "../../content/donation.functions";

export const Route = createFileRoute("/donations/$donationId")({
	loader: async ({ params }) => {
		const result = await getDonation({ data: params.donationId });
		if (!result) throw notFound();
		return result;
	},
	component: Donation,
});

function Donation() {
	const { record, children } = Route.useLoaderData();
	return <DonationCampaign record={record} items={children} />;
}
