import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";
export const Route = createFileRoute("/datenschutz")({
	head: () => ({ meta: [{ title: "Datenschutz · Uncle-T" }] }),
	component: () => (
		<LegalPage title="Datenschutz">
			<section>
				<h2>Verantwortliche Stelle</h2>
				<p>
					Uncle-T GmbH, Thomas Habegger, Zelgliweg 2, 5506 Mägenwil. Kontakt:
					info@uncle-t.ch.
				</p>
			</section>
			<section>
				<h2>Anfragen</h2>
				<p>
					Wenn Sie uns kontaktieren, verwenden wir Ihre Angaben ausschliesslich
					zur Bearbeitung Ihrer Anfrage und allfälliger Anschlussfragen. Die
					Daten werden nicht ohne Rechtsgrundlage weitergegeben.
				</p>
			</section>
			<section>
				<h2>Technische Daten</h2>
				<p>
					Beim Besuch können technisch notwendige Verbindungsdaten durch den
					Hosting-Anbieter verarbeitet werden. Diese Website setzt in ihrer
					aktuellen Form keine Analyse- oder Marketing-Cookies ein.
				</p>
			</section>
			<section>
				<h2>Ihre Rechte</h2>
				<p>
					Sie können Auskunft, Berichtigung oder Löschung Ihrer
					personenbezogenen Daten verlangen, soweit keine gesetzlichen
					Aufbewahrungspflichten entgegenstehen.
				</p>
			</section>
		</LegalPage>
	),
});
