import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../components/legal-page";

const terms = [
	[
		"Preise",
		"Preise in Offerten sind Richtwerte, sofern nicht ausdrücklich ein Pauschalpreis vereinbart wurde. Verrechnet wird gemäss Vereinbarung beziehungsweise effektivem Aufwand.",
	],
	[
		"Personenzahl",
		"Änderungen der Personenzahl müssen spätestens vier Arbeitstage vor dem Anlass schriftlich mitgeteilt werden. Spätere Änderungen können nicht garantiert werden.",
	],
	[
		"Annullierung",
		"Bei einer Annullierung können abhängig vom Zeitpunkt bereits entstandene Aufwände und vereinbarte Leistungen verrechnet werden.",
	],
	[
		"Infrastruktur",
		"Erforderliche Räume sowie Wasser und Strom werden, sofern nicht anders vereinbart, durch den Kunden in geeignetem Zustand bereitgestellt.",
	],
	[
		"Material",
		"Zur Verfügung gestelltes Material ist vollständig und unversehrt zurückzugeben. Verluste und Beschädigungen können verrechnet werden.",
	],
	[
		"Zahlung",
		"Rechnungen sind, sofern nicht anders vereinbart, innerhalb von 14 Tagen ab Rechnungsdatum zahlbar.",
	],
	[
		"Recht",
		"Es gilt schweizerisches Recht. Gerichtsstand ist der Kanton Aargau, soweit gesetzlich zulässig.",
	],
] as const;
export const Route = createFileRoute("/agb")({
	head: () => ({ meta: [{ title: "AGB · Uncle-T" }] }),
	component: () => (
		<LegalPage title="Allgemeine Geschäftsbedingungen">
			<p>
				Die konkreten Leistungen ergeben sich aus der jeweiligen Offerte und
				Vereinbarung mit Uncle-T GmbH.
			</p>
			{terms.map(([title, text], index) => (
				<section key={title}>
					<h2>
						{index + 1}. {title}
					</h2>
					<p>{text}</p>
				</section>
			))}
		</LegalPage>
	),
});
