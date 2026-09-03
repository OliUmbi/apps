import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Award, MapPin, Users } from "lucide-react";

export const Route = createFileRoute("/")({ component: HomePage });

const formats = [
	{
		number: "01",
		title: "Private Dinner",
		copy: "Ein persönliches Menü in Ihrem Zuhause – von der Idee bis zum letzten Teller.",
	},
	{
		number: "02",
		title: "Feste & Hochzeiten",
		copy: "Ein stimmiges Essen, das Menschen zusammenbringt und sich selbstverständlich in den Tag einfügt.",
	},
	{
		number: "03",
		title: "Business & Grossanlässe",
		copy: "Professionelle Abläufe, verlässlicher Service und ein Angebot, das zur Grösse des Anlasses passt.",
	},
];

function HomePage() {
	return (
		<>
			<section className="relative min-h-[92svh] overflow-hidden pt-20">
				<img
					src="/images/private-dinner.jpg"
					alt="Thomas Habegger serviert ein privates Dinner"
					className="absolute inset-0 size-full object-cover object-center"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,15,.96)_0%,rgba(17,17,15,.72)_47%,rgba(17,17,15,.18)_100%)]" />
				<div className="shell relative z-10 flex min-h-[calc(92svh-5rem)] items-end pb-14 md:items-center md:pb-0">
					<div className="max-w-4xl">
						<p className="eyebrow text-brass-light">
							Catering · Private Dining · Mägenwil
						</p>
						<h1 className="display-title mt-6 text-[clamp(4.1rem,10vw,9.5rem)]">
							Ihr Anlass.
							<br />
							<span className="text-brass-light italic">Meine Küche.</span>
						</h1>
						<p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/70 md:text-xl">
							Von zwei Gästen am eigenen Tisch bis zur grossen Firmenfeier:
							Thomas Habegger entwickelt Essen, Service und Ablauf als ein
							persönliches Ganzes.
						</p>
						<div className="mt-10 flex flex-wrap gap-3">
							<Link to="/anfragen" className="button-primary">
								Anlass besprechen <ArrowRight size={17} />
							</Link>
							<Link to="/angebot" className="button-secondary">
								Angebot entdecken
							</Link>
						</div>
					</div>
				</div>
				<a
					href="#angebot"
					className="absolute right-5 bottom-8 z-10 hidden items-center gap-3 text-xs tracking-widest text-bone/55 uppercase md:flex"
				>
					Entdecken <ArrowDown size={16} />
				</a>
			</section>

			<section id="angebot" className="bg-paper py-24 text-night md:py-36">
				<div className="shell">
					<div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end">
						<p className="eyebrow text-brass">Ein Gastgeber für jede Grösse</p>
						<h2 className="display-title text-5xl md:text-7xl">
							Nicht von der Stange.
							<br />
							Sondern für diesen einen Anlass.
						</h2>
					</div>
					<div className="mt-16 grid border-t border-night/15 md:grid-cols-3">
						{formats.map((format) => (
							<article
								key={format.number}
								className="border-b border-night/15 py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
							>
								<span className="font-mono text-xs text-brass">
									{format.number}
								</span>
								<h3 className="mt-10 font-serif text-3xl">{format.title}</h3>
								<p className="mt-4 leading-relaxed text-night/60">
									{format.copy}
								</p>
							</article>
						))}
					</div>
					<Link
						to="/angebot"
						className="mt-10 inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase hover:text-brass"
					>
						So entsteht Ihr Angebot <ArrowRight size={16} />
					</Link>
				</div>
			</section>

			<section className="grid lg:grid-cols-2">
				<div className="image-treatment min-h-[520px]">
					<img
						src="/images/thomas.jpg"
						alt="Thomas Habegger, Koch und Gastgeber von Uncle-T"
						className="object-top"
					/>
				</div>
				<div className="flex items-center bg-coal px-6 py-20 md:px-16 lg:px-20">
					<div>
						<p className="eyebrow text-brass">Thomas Habegger</p>
						<h2 className="display-title mt-7 text-5xl md:text-7xl">
							Erfahrung, die man nicht erklären muss. Man schmeckt sie.
						</h2>
						<p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/60">
							Gusto-Sieger 2013, drei Jahre im Gstaad Palace, internationale
							Erfahrung als Privatkoch und heute selbständig im Aargau. Hinter
							Uncle-T steht eine Küche mit Anspruch – und ein Gastgeber, der
							zuhört.
						</p>
						<div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-bone/65">
							<span className="flex items-center gap-2">
								<Award size={17} className="text-brass" /> Gusto-Sieger 2013
							</span>
							<span className="flex items-center gap-2">
								<MapPin size={17} className="text-brass" /> Mägenwil, Aargau
							</span>
							<span className="flex items-center gap-2">
								<Users size={17} className="text-brass" /> 2 bis viele Gäste
							</span>
						</div>
						<Link to="/ueber-mich" className="button-secondary mt-10">
							Thomas kennenlernen
						</Link>
					</div>
				</div>
			</section>

			<section className="shell py-24 md:py-36">
				<div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
					<div>
						<p className="eyebrow text-brass">Ausgewählte Einblicke</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							Jeder Anlass hinterlässt eine eigene Handschrift.
						</h2>
					</div>
					<p className="max-w-md leading-relaxed text-bone/55 md:justify-self-end">
						Vom gesetzten Dinner über das lebendige Buffet bis zum Essen am
						offenen Feuer: Format und Menü folgen den Menschen, nicht einem
						festen Paket.
					</p>
				</div>
				<div className="mt-14 grid auto-rows-[280px] gap-3 md:grid-cols-12">
					<div className="image-treatment md:col-span-7 md:row-span-2">
						<img
							src="/images/event-table.jpg"
							alt="Gedeckte Tafel für einen Anlass"
						/>
					</div>
					<div className="image-treatment md:col-span-5">
						<img
							src="/images/plating.jpg"
							alt="Frische Pasta wird angerichtet"
						/>
					</div>
					<div className="image-treatment md:col-span-5">
						<img src="/images/fire.jpg" alt="Kochen am offenen Feuer" />
					</div>
				</div>
				<Link to="/einblicke" className="button-secondary mt-10">
					Mehr Einblicke <ArrowRight size={16} />
				</Link>
			</section>

			<section className="border-y border-brass/25 bg-brass py-20 text-night md:py-28">
				<div className="shell grid gap-10 md:grid-cols-[1.3fr_.7fr] md:items-end">
					<div>
						<p className="eyebrow">Der nächste Anlass beginnt hier</p>
						<h2 className="display-title mt-5 text-5xl md:text-7xl">
							Erzählen Sie mir, was Sie vorhaben.
						</h2>
					</div>
					<div>
						<p className="leading-relaxed text-night/65">
							Ein Datum, ein Ort und eine ungefähre Gästezahl reichen für den
							Anfang. Alles Weitere entsteht im persönlichen Gespräch.
						</p>
						<Link
							to="/anfragen"
							className="mt-7 inline-flex min-h-13 items-center gap-2 bg-night px-5 text-xs font-bold tracking-widest text-bone uppercase"
						>
							Unverbindlich anfragen <ArrowRight size={16} />
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
