import { m } from "@oliumbi/i18n/messages";

export function NoCurrentDonations() {
	return (
		<header className="shell page-hero">
			<div>
				<p className="kicker">{m.jublawoma_donations_eyebrow()}</p>
				<h1>
					{m.jublawoma_donations_title()}
					<br />
					<span>{m.jublawoma_donations_title_accent()}</span>
				</h1>
				<p>{m.jublawoma_donations_description()}</p>
			</div>
			<img src="/assets/images/doodles/loving.svg" alt="" />
		</header>
	);
}
