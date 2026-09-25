import { m } from "@oliumbi/i18n/messages";
import { HeartHandshake } from "lucide-react";
import { useState } from "react";
import { type PublicDonationCampaign, roundQuantity } from "../model/donations";
import { DonationCommitmentForm } from "./donations/donation-commitment-form";
import { DonationIntroduction } from "./donations/donation-introduction";
import { DonationItemCard } from "./donations/donation-item-card";

export function DonationCampaign({
	campaign,
}: {
	campaign: PublicDonationCampaign;
}) {
	const { items } = campaign;
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const availableItems = items.filter(
		(item) => roundQuantity(item.remaining) > 0,
	);
	const selected = items.find((item) => item.id === selectedId);

	return (
		<section className="donation-campaign shell">
			<DonationIntroduction campaign={campaign} />
			<div className="donation-items">
				<div className="donation-items-heading">
					<HeartHandshake size={28} aria-hidden="true" />
					<div>
						<p className="kicker">{m.jublawoma_donation_items_eyebrow()}</p>
						<h2>{m.jublawoma_donation_items_title()}</h2>
					</div>
				</div>
				<div className="donation-item-list">
					{items.map((item) => (
						<DonationItemCard
							key={item.id}
							item={item}
							selected={item.id === selectedId}
							onSelect={() => setSelectedId(item.id)}
						/>
					))}
				</div>
				{selected ? (
					<DonationCommitmentForm
						key={selected.id}
						donationId={campaign.id}
						item={selected}
					/>
				) : availableItems.length ? (
					<p className="donation-select-help">
						{m.jublawoma_donation_select_help()}
					</p>
				) : null}
			</div>
		</section>
	);
}
