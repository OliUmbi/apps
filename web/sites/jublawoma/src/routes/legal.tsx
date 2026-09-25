import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { getLeadership } from "../data/members";

export const Route = createFileRoute("/legal")({
	loader: () => getLeadership(),
	component: Imprint,
});
function Imprint() {
	const leadership = Route.useLoaderData();
	return (
		<section className="shell legal">
			<p className="kicker">{m.legal()}</p>
			<h1>{m.imprint()}</h1>
			<h2>{m.contact()}</h2>
			<p>
				{m.jublawoma_organization()}
				<br />
				{m.jublawoma_legal_street()}
				<br />
				{m.jublawoma_legal_postal_address()}
			</p>
			<p>
				<a href="mailto:scharleitung@jublawoma.ch">{m.jublawoma_email()}</a>
			</p>
			<h2>{m.jublawoma_legal_leadership_title()}</h2>
			<p>
				{leadership.length
					? leadership.map((member) => member.name).join(" · ")
					: m.jublawoma_legal_leadership_names()}
			</p>
			<h2>{m.jublawoma_legal_liability_copyright_title()}</h2>
			<p>{m.jublawoma_legal_liability_copyright_body()}</p>
		</section>
	);
}
