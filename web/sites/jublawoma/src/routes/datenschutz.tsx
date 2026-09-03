import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
export const Route = createFileRoute("/datenschutz")({ component: Privacy });
function Privacy() {
	return (
		<section className="shell legal">
			<p className="kicker">Persönliche Daten</p>
			<h1>Datenschutz</h1>
			<p>
				Der sorgfältige Umgang mit persönlichen Daten – besonders mit Daten und
				Bildern von Kindern und Jugendlichen – ist uns wichtig. Es gelten das
				Schweizer Datenschutzgesetz und die Regeln von Jungwacht Blauring.
			</p>
			<p>Die vollständige Datenschutzerklärung ist als Dokument verfügbar.</p>
			<a
				className="button dark"
				href="/assets/documents/Datenschutzerklärung-Jubla-Woma.pdf"
				target="_blank"
				rel="noopener"
			>
				<Download size={17} /> Datenschutzerklärung öffnen
			</a>
		</section>
	);
}
