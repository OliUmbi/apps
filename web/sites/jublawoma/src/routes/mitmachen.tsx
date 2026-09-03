import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail } from "lucide-react";
export const Route = createFileRoute("/mitmachen")({ component: Join });
function Join() {
	return (
		<>
			<section className="page-hero shell join-hero">
				<div>
					<p className="kicker">Mitmachen</p>
					<h1>
						Reinschauen.
						<br />
						<span>Mitmachen.</span>
						<br />
						Dazugehören.
					</h1>
					<p>
						Kinder ab der 3. Klasse können unsere Schar kennenlernen. Der
						einfachste Einstieg ist eine Schnupper-Gruppenstunde.
					</p>
				</div>
				<img src="/assets/images/doodles/dog.svg" alt="" />
			</section>
			<section className="shell steps">
				<article>
					<span>1</span>
					<h2>Melden</h2>
					<p>
						Schreib der Scharleitung kurz, wer ihr seid und aus welchem Ort ihr
						kommt.
					</p>
				</article>
				<article>
					<span>2</span>
					<h2>Schnuppern</h2>
					<p>
						Wir finden eine passende Gruppe und vereinbaren eine unverbindliche
						Gruppenstunde.
					</p>
				</article>
				<article>
					<span>3</span>
					<h2>Entscheiden</h2>
					<p>
						Wenn es passt, füllt ihr gemeinsam die Anmeldung aus. Fragen klären
						wir persönlich.
					</p>
				</article>
			</section>
			<section className="contact-card shell">
				<img src="/assets/images/doodles/groovy-sitting.svg" alt="" />
				<div>
					<p className="kicker light">Noch etwas unklar?</p>
					<h2>Wir freuen uns, von euch zu hören.</h2>
					<div className="button-row">
						<a className="button light" href="mailto:scharleitung@jublawoma.ch">
							<Mail size={17} /> Scharleitung schreiben
						</a>
						<a
							className="text-link light"
							href="/assets/documents/Anmeldung-Jubla-Woma.pdf"
							target="_blank"
							rel="noopener"
						>
							<Download size={16} /> Anmeldung öffnen
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
