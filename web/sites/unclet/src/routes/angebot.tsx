import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/angebot")({
	head: () => ({
		meta: [
			{ title: "Angebot · Uncle-T Catering" },
			{
				name: "description",
				content:
					"Private Dinner, Hochzeiten, Firmenanlässe und Catering – individuell geplant von Uncle-T.",
			},
		],
	}),
	component: OfferPage,
});

const steps = [
	[
		"Kennenlernen",
		"Sie erzählen von Anlass, Gästen, Ort und dem Gefühl, das entstehen soll.",
	],
	[
		"Konzept",
		"Thomas entwickelt Menü, Service und Ablauf als verständliches Gesamtangebot.",
	],
	[
		"Vorbereitung",
		"Einkauf, Organisation und Abstimmung laufen persönlich und zuverlässig.",
	],
	[
		"Gastgeben",
		"Am Anlass dürfen Sie Gastgeber sein. Küche und Ablauf liegen in sicheren Händen.",
	],
];

function OfferPage() {
	return (
		<>
			<PageHero
				eyebrow="Ein Angebot, viele Möglichkeiten"
				title={
					<>
						Vom Dinner zu zweit
						<br />
						<span className="text-brass-light italic">
							bis zum grossen Fest.
						</span>
					</>
				}
				intro="Uncle-T trennt nicht zwischen Privatkoch und Catering. Entscheidend ist, was Ihr Anlass braucht – kulinarisch, organisatorisch und menschlich."
				image="/images/catering.jpg"
			/>
			<section className="bg-paper py-24 text-night md:py-32">
				<div className="shell grid gap-16 lg:grid-cols-[.75fr_1.25fr]">
					<div>
						<p className="eyebrow text-brass">Was möglich ist</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							Passend zum Anlass, nicht zur Schublade.
						</h2>
					</div>
					<div className="grid gap-px bg-night/15 sm:grid-cols-2">
						{[
							"Private Dinner zuhause",
							"Geburtstage & Familienfeste",
							"Hochzeiten",
							"Firmenessen & Apéros",
							"Buffets & Flying Dinner",
							"Kochen am Feuer",
						].map((item) => (
							<div
								key={item}
								className="flex items-center gap-3 bg-paper p-6 text-lg"
							>
								<Check size={18} className="shrink-0 text-brass" /> {item}
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="shell py-24 md:py-32">
				<div className="grid gap-12 lg:grid-cols-2">
					<div className="image-treatment min-h-[520px]">
						<img src="/images/buffet.jpg" alt="Buffet von Uncle-T" />
					</div>
					<div className="flex items-center lg:px-12">
						<div>
							<p className="eyebrow text-brass">Von der Anfrage zum Anlass</p>
							<div className="mt-10">
								{steps.map(([title, copy], index) => (
									<div
										key={title}
										className="grid grid-cols-[3rem_1fr] gap-4 border-t border-bone/15 py-6"
									>
										<span className="font-mono text-xs text-brass">
											0{index + 1}
										</span>
										<div>
											<h3 className="font-serif text-2xl">{title}</h3>
											<p className="mt-2 leading-relaxed text-bone/55">
												{copy}
											</p>
										</div>
									</div>
								))}
							</div>
							<Link to="/anfragen" className="button-primary mt-8">
								Anlass besprechen <ArrowRight size={17} />
							</Link>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
