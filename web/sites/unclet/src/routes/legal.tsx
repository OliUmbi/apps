import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";
export const Route = createFileRoute("/legal")({
	head: () => ({ meta: [{ title: m.unclet_routes_legal_title() }] }),
	component: () => (
		<LegalPage title={m.unclet_routes_legal_title_2()}>
			<section>
				<h2>{m.unclet_routes_legal_heading()}</h2>
				<p>
					{m.unclet_routes_legal_paragraph()}
					<br />
					{m.unclet_routes_legal_paragraph_2()}
					<br />
					{m.unclet_routes_legal_paragraph_3()}
					<br />
					{m.unclet_routes_legal_paragraph_4()}
					<br />
					{m.unclet_routes_legal_paragraph_5()}
				</p>
			</section>
			<section>
				<h2>{m.unclet_routes_legal_heading_2()}</h2>
				<p>
					<a href="mailto:info@uncle-t.ch">{m.unclet_routes_legal_text()}</a>
				</p>
			</section>
			<section>
				<h2>{m.unclet_routes_legal_heading_3()}</h2>
				<p>{m.unclet_routes_legal_paragraph_6()}</p>
			</section>
		</LegalPage>
	),
});
