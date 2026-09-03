import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";
export const Route = createFileRoute("/impressum")({
	head: () => ({ meta: [{ title: "Impressum · Uncle-T" }] }),
	component: () => (
		<LegalPage title="Impressum">
			<section>
				<h2>Verantwortlich</h2>
				<p>
					Uncle-T GmbH
					<br />
					Thomas Habegger
					<br />
					Zelgliweg 2<br />
					5506 Mägenwil
					<br />
					Schweiz
				</p>
			</section>
			<section>
				<h2>Kontakt</h2>
				<p>
					<a href="mailto:info@uncle-t.ch">info@uncle-t.ch</a>
				</p>
			</section>
			<section>
				<h2>Urheberrecht</h2>
				<p>
					Das Copyright für die Inhalte und Bilder dieser Website liegt bei
					Uncle-T GmbH. Eine Weiterverwendung bedarf der vorherigen Zustimmung.
				</p>
			</section>
		</LegalPage>
	),
});
