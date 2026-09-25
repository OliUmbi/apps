import { m } from "@oliumbi/i18n/messages";
import { CalendarDays, Phone } from "lucide-react";
import {
	formatDonationDates,
	type PublicDonationCampaign,
} from "../../model/donations";

export function DonationIntroduction({
	campaign,
}: {
	campaign: PublicDonationCampaign;
}) {
	return (
		<header className="donation-focus">
			<div>
				<p className="kicker">{m.jublawoma_donations_eyebrow()}</p>
				<h1>{campaign.title}</h1>
				<p className="donation-lead">{campaign.description}</p>
			</div>
			<div className="donation-meta">
				<span>
					<CalendarDays size={18} aria-hidden="true" />
					{formatDonationDates(campaign.startsAt, campaign.endsAt)}
				</span>
				<span>
					<Phone size={18} aria-hidden="true" /> {campaign.contact}
				</span>
			</div>
		</header>
	);
}
