import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";

export const Route = createFileRoute("/privacy")({
	head: () => ({ meta: [{ title: m.unclet_privacy_page_title() }] }),
	component: () => (
		<LegalPage title={m.privacy()}>
			<section>
				<h2>{m.unclet_privacy_controller_title()}</h2>
				<p>{m.unclet_privacy_controller_body()}</p>
			</section>
			<section>
				<h2>{m.unclet_privacy_inquiries_title()}</h2>
				<p>{m.unclet_privacy_inquiries_body()}</p>
			</section>
			<section>
				<h2>{m.unclet_privacy_technical_data_title()}</h2>
				<p>{m.unclet_privacy_technical_data_body()}</p>
			</section>
			<section>
				<h2>{m.unclet_privacy_rights_title()}</h2>
				<p>{m.unclet_privacy_rights_body()}</p>
			</section>
		</LegalPage>
	),
});
