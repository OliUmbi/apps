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
					<p className="kicker">{m.jublawoma_about_eyebrow()}</p>
					<h1>
						{m.jublawoma_about_title()}
						<br />
						<span className="page-title-accent">
							{m.jublawoma_about_title_accent()}
						</span>
					</h1>
					<p>{m.jublawoma_about_description()}</p>
				</div>
				<img
					className="photo"
					src="/assets/images/people/scharleitung.jpg"
					alt={m.jublawoma_about_leadership_alt()}
				/>
			</section>
			<section className="shell split-body">
				<h2>
					{m.jublawoma_about_training_title()}
					<br />
					{m.jublawoma_about_training_title_accent()}
				</h2>
				<div>
					<p>{m.jublawoma_about_training_body()}</p>
					<p>{m.jublawoma_about_inclusion_body()}</p>
				</div>
			</section>
			<PublicMembers />
			<PartnerOrganizations />
		</>
	);
}
