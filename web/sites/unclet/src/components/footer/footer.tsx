import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t border-bone/10 bg-night py-14">
			<div className="shell grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
				<div>
					<p className="font-serif text-4xl">Uncle-T</p>
					<p className="mt-4 max-w-sm text-sm leading-relaxed text-bone/55">
						Massgeschneiderte Kulinarik für private Feiern, Hochzeiten und
						Firmenanlässe im Aargau und darüber hinaus.
					</p>
				</div>
				<div className="text-sm leading-7 text-bone/60">
					<p className="eyebrow mb-3 text-brass">Kontakt</p>
					<p>Uncle-T GmbH · Thomas Habegger</p>
					<p>Zelgliweg 2 · 5506 Mägenwil</p>
					<a
						href="mailto:info@uncle-t.ch"
						className="mt-2 inline-block text-bone hover:text-brass-light"
					>
						info@uncle-t.ch
					</a>
				</div>
				<div className="flex flex-col items-start gap-3 text-sm text-bone/60">
					<p className="eyebrow mb-1 text-brass">Weiter</p>
					<a
						href="https://www.instagram.com/unclet_gmbh/"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2 hover:text-brass-light"
					>
						Instagram <ArrowUpRight size={14} />
					</a>
					<Link to="/impressum" className="hover:text-brass-light">
						Impressum
					</Link>
					<Link to="/datenschutz" className="hover:text-brass-light">
						Datenschutz
					</Link>
					<Link to="/agb" className="hover:text-brass-light">
						AGB
					</Link>
				</div>
			</div>
		</footer>
	);
}
