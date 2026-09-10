import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
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
			<section className="network">
				<div className="shell">
					<p className="kicker light">
						{m.jublawoma_routes_about_paragraph_5()}
					</p>
					<div className="network-links">
						<a href="https://www.jubla.ch/" target="_blank" rel="noreferrer">
							{m.jublawoma_routes_about_text_2()}
							<ExternalLink />
						</a>
						<a
							href="https://www.jublaaargau.ch/"
							target="_blank"
							rel="noreferrer"
						>
							{m.jublawoma_routes_about_text_3()}
							<ExternalLink />
						</a>
						<a
							href="https://www.jugendundsport.ch/de"
							target="_blank"
							rel="noreferrer"
						>
							{m.jublawoma_routes_about_text_4()}
							<ExternalLink />
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
