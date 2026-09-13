import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { PartnerOrganizations } from "../components/partner-organizations";
import { PublicMembers } from "../components/public-members";
export const Route = createFileRoute("/about")({ component: About });
function About() {
	return (
		<>
			<section className="page-hero shell about-hero">
				<div>
					<p className="kicker">{m.jublawoma_routes_about_paragraph()}</p>
					<h1>
						{m.jublawoma_routes_about_heading()}
						<br />
						<span>{m.jublawoma_routes_about_text()}</span>
					</h1>
					<p>{m.jublawoma_routes_about_paragraph_2()}</p>
				</div>
				<img
					className="photo"
					src="/assets/images/people/scharleitung.jpg"
					alt={m.jublawoma_routes_about_alt()}
				/>
			</section>
			<section className="shell split-copy">
				<h2>
					{m.jublawoma_routes_about_heading_2()}
					<br />
					{m.jublawoma_routes_about_heading_3()}
				</h2>
				<div>
					<p>{m.jublawoma_routes_about_paragraph_3()}</p>
					<p>{m.jublawoma_routes_about_paragraph_4()}</p>
				</div>
			</section>
			<PublicMembers />
			<PartnerOrganizations />
		</>
	);
}
