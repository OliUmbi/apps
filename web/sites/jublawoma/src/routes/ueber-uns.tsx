import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
export const Route = createFileRoute("/ueber-uns")({ component: About });
function About() {
	return (
		<>
			<section className="page-hero shell about-hero">
				<div>
					<p className="kicker">Unsere Schar</p>
					<h1>
						Viel Verantwortung.
						<br />
						<span>Noch mehr Freude.</span>
					</h1>
					<p>
						Das Leitungsteam besteht aus jungen Erwachsenen und gestaltet ein
						sicheres, vielseitiges Freizeitangebot für Kinder und Jugendliche.
					</p>
				</div>
				<img
					className="photo"
					src="/assets/images/people/scharleitung.jpg"
					alt="Die Scharleitung der Jubla Woma"
				/>
			</section>
			<section className="shell split-copy">
				<h2>
					Gut begleitet.
					<br />
					Solide ausgebildet.
				</h2>
				<div>
					<p>
						Leitende werden in Zusammenarbeit mit Jugend + Sport aus- und
						weitergebildet. Coaches, Präses und Kantonsleitung unterstützen die
						Schar fachlich und organisatorisch.
					</p>
					<p>
						Jubla ist offen für alle Kinder und Jugendlichen – unabhängig von
						Konfession, Fähigkeiten oder Kultur.
					</p>
				</div>
			</section>
			<section className="shell leadership">
				<div>
					<p className="kicker">Scharleitung</p>
					<h2>
						Raphael, Lynn
						<br />
						und Fabian.
					</h2>
				</div>
				<img
					src="/assets/images/people/scharleitung.jpg"
					alt="Raphael Schreiber, Lynn Horlacher und Fabian Stahel"
				/>
			</section>
			<section className="network">
				<div className="shell">
					<p className="kicker light">Teil eines starken Netzwerks</p>
					<div className="network-links">
						<a href="https://www.jubla.ch/" target="_blank" rel="noreferrer">
							Jubla Schweiz <ExternalLink />
						</a>
						<a
							href="https://www.jublaaargau.ch/"
							target="_blank"
							rel="noreferrer"
						>
							Jubla Aargau <ExternalLink />
						</a>
						<a
							href="https://www.jugendundsport.ch/de"
							target="_blank"
							rel="noreferrer"
						>
							Jugend + Sport <ExternalLink />
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
