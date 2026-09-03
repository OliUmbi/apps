import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/impressum")({ component: Imprint });
function Imprint() {
	return (
		<section className="shell legal">
			<p className="kicker">Rechtliches</p>
			<h1>Impressum</h1>
			<h2>Kontakt</h2>
			<p>
				Jungwacht Blauring Wohlenschwil Mägenwil
				<br />
				Vogelsangstrasse 2<br />
				5512 Wohlenschwil
			</p>
			<p>
				<a href="mailto:scharleitung@jublawoma.ch">scharleitung@jublawoma.ch</a>
			</p>
			<h2>Scharleitung</h2>
			<p>Fabian Stahel · Raphael Schreiber · Lynn Horlacher</p>
			<h2>Haftung und Urheberrecht</h2>
			<p>
				Die Inhalte werden sorgfältig gepflegt. Für Vollständigkeit, Richtigkeit
				und Verfügbarkeit wird keine Gewähr übernommen. Inhalte und Bilder
				dürfen nur mit Zustimmung der jeweiligen Rechteinhaber verwendet werden.
			</p>
		</section>
	);
}
