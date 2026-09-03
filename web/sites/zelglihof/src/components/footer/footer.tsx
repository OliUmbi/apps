import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Sprout } from "lucide-react";

export default function Footer() {
	return (
		<footer className="mt-24 bg-forest text-cream">
			<div className="shell grid gap-14 py-14 md:grid-cols-[1.3fr_0.7fr_0.7fr] md:py-20">
				<div className="max-w-md">
					<div className="flex items-center gap-3">
						<span className="grid size-11 place-items-center rounded-full bg-sun text-ink">
							<Sprout size={21} />
						</span>
						<span className="font-serif text-3xl font-bold">Zelglihof</span>
					</div>
					<p className="mt-6 text-lg leading-relaxed text-cream/72">
						Landwirtschaft mit Haltung. Lebensmittel mit Herkunft. Direkt aus
						Mägenwil.
					</p>
				</div>
				<div>
					<p className="eyebrow text-sun">Entdecken</p>
					<nav className="mt-6 grid gap-3 text-sm font-semibold">
						<Link to="/aktuelles" className="hover:text-sun">
							Aktuelles
						</Link>
						<Link to="/hofladen" className="hover:text-sun">
							Hofladen
						</Link>
						<Link to="/hof" className="hover:text-sun">
							Unser Hof
						</Link>
						<Link to="/kontakt" className="hover:text-sun">
							Kontakt
						</Link>
					</nav>
				</div>
				<div>
					<p className="eyebrow text-sun">Hier zuhause</p>
					<a
						href="https://www.openstreetmap.org/search?query=Zelgliweg%202%2C%205506%20M%C3%A4genwil"
						target="_blank"
						rel="noreferrer"
						className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-cream/75 hover:text-cream"
					>
						<MapPin className="mt-0.5 shrink-0" size={17} />
						<span>
							Zelgliweg 2<br />
							5506 Mägenwil
						</span>
						<ArrowUpRight className="mt-0.5 shrink-0" size={15} />
					</a>
				</div>
			</div>
			<div className="border-t border-white/12">
				<div className="shell flex flex-col gap-4 py-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
					<p>
						© {new Date().getFullYear()} Zelglihof · Familienbetrieb Habegger
					</p>
					<div className="flex flex-wrap gap-x-5 gap-y-2">
						<Link to="/impressum" className="hover:text-cream">
							Impressum
						</Link>
						<Link to="/datenschutz" className="hover:text-cream">
							Datenschutz
						</Link>
						<Link to="/agb" className="hover:text-cream">
							AGB
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
