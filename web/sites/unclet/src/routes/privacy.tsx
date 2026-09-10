import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";
export const Route = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: m.unclet_routes_privacy_title() }] }),
	component: () => (
		<LegalPage title={m.unclet_routes_privacy_title_2()}>
			<section>
				<h2>{m.unclet_routes_privacy_heading()}</h2>
				<p>{m.unclet_routes_privacy_paragraph()}</p>
			</section>
			<section>
				<h2>{m.unclet_routes_privacy_heading_2()}</h2>
				<p>{m.unclet_routes_privacy_paragraph_2()}</p>
			</section>
			<section>
				<h2>{m.unclet_routes_privacy_heading_3()}</h2>
				<p>{m.unclet_routes_privacy_paragraph_3()}</p>
			</section>
			<section>
				<h2>{m.unclet_routes_privacy_heading_4()}</h2>
				<p>{m.unclet_routes_privacy_paragraph_4()}</p>
			</section>
		</LegalPage>
	),
});
