import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { DonationCampaign } from "../../components/donation-campaign";
import { getDonation } from "../../content/donation.functions";
import { listPublicRecords } from "../../content/public.functions";
export const Route = createFileRoute("/donations/")({
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
	if (campaign)
		return (
			<DonationCampaign record={campaign.record} items={campaign.children} />
		);
	return (
		<header className="shell page-hero">
			<div>
				<p className="kicker">{m.jublawoma_routes_donations_paragraph()}</p>
				<h1>
					{m.jublawoma_routes_donations_heading()}
					<br />
					<span>{m.jublawoma_routes_donations_text()}</span>
				</h1>
				<p>{m.jublawoma_routes_donations_paragraph_2()}</p>
			</div>
			<img src="/assets/images/doodles/loving.svg" alt="" />
		</header>
	);
}
