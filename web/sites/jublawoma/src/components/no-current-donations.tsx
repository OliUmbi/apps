import { m } from "@oliumbi/i18n/messages";

export function NoCurrentDonations() {
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
