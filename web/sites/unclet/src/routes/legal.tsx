import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";

export const Route = createFileRoute("/legal")({
	head: () => ({ meta: [{ title: m.unclet_legal_page_title() }] }),
	component: () => (
		<LegalPage title={m.imprint()}>
			<section>
				<h2>{m.responsible_party()}</h2>
				<p>
					{m.unclet_company_name()}
					<br />
					{m.unclet_chef_name()}
					<br />
					{m.unclet_street()}
					<br />
					{m.unclet_postal_address()}
					<br />
					{m.switzerland()}
				</p>
			</section>
			<section>
				<h2>{m.contact()}</h2>
				<p>
					<a href="mailto:info@uncle-t.ch">{m.unclet_email()}</a>
				</p>
			</section>
			<section>
				<h2>{m.copyright_title()}</h2>
				<p>{m.unclet_legal_copyright_body()}</p>
			</section>
		</LegalPage>
	),
});
