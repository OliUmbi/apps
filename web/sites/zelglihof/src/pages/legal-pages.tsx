import type { ReactNode } from "react";

function LegalPage({
	eyebrow,
	title,
	children,
}: {
	eyebrow: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<article className="shell max-w-4xl py-14 md:py-24">
			<p className="eyebrow text-clay">{eyebrow}</p>
			<h1 className="display-title mt-5 text-6xl md:text-7xl">{title}</h1>
			<div className="mt-14 space-y-10 rounded-[2rem] bg-cream p-7 leading-relaxed text-ink/68 md:p-12 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-ink [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
				{children}
			</div>
		</article>
	);
}

export function ImprintPage() {
	return (
		<LegalPage eyebrow="Rechtliches" title="Impressum">
			<section>
				<h2>Verantwortlich</h2>
				<p>
					Familienbetrieb Habegger
					<br />
					Zelgliweg 2<br />
					5506 Mägenwil
					<br />
					Schweiz
				</p>
			</section>
			<section>
				<h2>Kontakt</h2>
				<p>Kontaktaufnahme über das Kontaktformular dieser Website.</p>
			</section>
			<section>
				<h2>Haftung</h2>
				<p>
					Wir bemühen uns um aktuelle und korrekte Informationen. Verfügbarkeit,
					Mengen, Termine und Preise können sich bei landwirtschaftlichen
					Produkten kurzfristig ändern. Verbindlich ist die persönliche
					Bestätigung des Betriebs.
				</p>
			</section>
			<section>
				<h2>Urheberrecht</h2>
				<p>
					Inhalte und Bilder dieser Website dürfen ohne vorherige Zustimmung
					nicht weiterverwendet werden.
				</p>
			</section>
		</LegalPage>
	);
}

export function PrivacyPage() {
	return (
		<LegalPage eyebrow="Rechtliches" title="Datenschutz">
			<section>
				<h2>Worum es geht</h2>
				<p>
					Wir bearbeiten nur Angaben, die für Newsletter, Reservationen und
					Anfragen notwendig sind. Dazu gehören insbesondere Name,
					E-Mail-Adresse, Telefonnummer, Produktauswahl und Nachricht.
				</p>
			</section>
			<section>
				<h2>Newsletter</h2>
				<p>
					Die Anmeldung erfolgt mit ausdrücklicher Einwilligung und
					anschliessender Bestätigung per E-Mail. Die Abmeldung ist jederzeit
					über den Link in einer Nachricht möglich. Wir speichern den Anmelde-
					und Bestätigungszeitpunkt als Nachweis.
				</p>
			</section>
			<section>
				<h2>Reservationen und Kontakt</h2>
				<p>
					Deine Angaben werden zur Bearbeitung der Reservation oder Anfrage
					gespeichert und nicht für fremde Werbezwecke weitergegeben.
					Gesetzliche Aufbewahrungspflichten bleiben vorbehalten.
				</p>
			</section>
			<section>
				<h2>Technischer Betrieb</h2>
				<p>
					Beim Aufruf der Website können technisch notwendige Protokolldaten
					entstehen. Wir setzen für den öffentlichen Inhalt keine Analyse- oder
					Werbe-Cookies ein.
				</p>
			</section>
			<section>
				<h2>Deine Rechte</h2>
				<p>
					Du kannst Auskunft, Berichtigung oder Löschung deiner
					personenbezogenen Daten verlangen, soweit keine gesetzliche Pflicht
					entgegensteht. Nutze dafür das Kontaktformular.
				</p>
			</section>
		</LegalPage>
	);
}

export function TermsPage() {
	return (
		<LegalPage eyebrow="Rechtliches" title="Reservationsbedingungen">
			<section>
				<h2>Keine Online-Zahlung</h2>
				<p>
					Eine Reservation über diese Website ist eine Anfrage zum Kauf. Sie
					wird erst verbindlich, wenn der Zelglihof sie persönlich bestätigt.
				</p>
			</section>
			<section>
				<h2>Verfügbarkeit</h2>
				<p>
					Die angezeigten Mengen bilden nur den für Online-Reservationen
					freigegebenen Teil des Vorrats ab. Naturprodukte können in Gewicht,
					Aussehen und tatsächlicher Menge abweichen. Bei Fleischpaketen sind
					Gewichtsangaben Richtwerte.
				</p>
			</section>
			<section>
				<h2>Abholung und Bezahlung</h2>
				<p>
					Abholtermin, Preis und Zahlungsart werden mit der Bestätigung
					mitgeteilt. Die Ware wird auf dem Zelglihof in Mägenwil abgeholt,
					sofern nichts anderes vereinbart wurde.
				</p>
			</section>
			<section>
				<h2>Änderung oder Absage</h2>
				<p>
					Falls du eine Reservation nicht wahrnehmen kannst, melde dich
					möglichst frühzeitig über das Kontaktformular und nenne deine
					Referenz.
				</p>
			</section>
		</LegalPage>
	);
}
