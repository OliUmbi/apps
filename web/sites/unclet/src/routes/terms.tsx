import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/terms")({
	head: () => pageHead({ title: m.unclet_terms_page_title() }),
	component: TermsPage,
});

function TermsPage() {
	// Messages resolve per render; module scope would bake one locale in (U-20).
	const terms = [
		[m.unclet_terms_prices_title(), m.unclet_terms_prices_body()],
		[m.unclet_terms_guests_title(), m.unclet_terms_guests_body()],
		[m.unclet_terms_cancellation_title(), m.unclet_terms_cancellation_body()],
		[
			m.unclet_terms_infrastructure_title(),
			m.unclet_terms_infrastructure_body(),
		],
		[m.unclet_terms_material_title(), m.unclet_terms_material_body()],
		[m.unclet_terms_payment_title(), m.unclet_terms_payment_body()],
		[m.unclet_terms_law_title(), m.unclet_terms_law_body()],
	] as const;
	return (
		<LegalPage title={m.unclet_terms_title()}>
			<p>{m.unclet_terms_body()}</p>
			{terms.map(([title, text], index) => (
				<section key={title}>
					<h2>
						{index + 1}. {title}
					</h2>
					<p>{text}</p>
				</section>
			))}
		</LegalPage>
	);
}
