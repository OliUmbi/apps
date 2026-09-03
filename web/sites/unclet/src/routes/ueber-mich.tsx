import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/ueber-mich")({
	head: () => ({
		meta: [
			{ title: "Thomas Habegger · Uncle-T" },
			{
				name: "description",
				content:
					"Thomas Habegger: Gusto-Sieger, erfahrener Privatkoch und Gründer von Uncle-T in Mägenwil.",
			},
		],
	}),
	component: AboutPage,
});

const experience = [
	{
		year: "2013",
		title: "Gusto-Sieger",
		copy: "Der Sieg am nationalen Kochwettbewerb für Lernende wird zum frühen Meilenstein.",
	},
	{
		year: "Danach",
		title: "Gstaad Palace",
		copy: "Drei Jahre in einem Haus, in dem Präzision, Diskretion und Gastfreundschaft täglich gelebt werden.",
	},
	{
		year: "International",
		title: "Privatkoch",
		copy: "Drei Jahre Kochen für private Gäste – persönlich, flexibel und mit Verantwortung für das ganze Erlebnis.",
	},
	{
		year: "Aargau",
		title: "4 Chef Catering",
		copy: "Erfahrung mit grösseren Anlässen, Teams und professionellen Catering-Abläufen.",
	},
	{
		year: "Seit 2024",
		title: "Uncle-T",
		copy: "Selbständig mit einer Küche, die Private Dining und Catering unter einer persönlichen Handschrift verbindet.",
	},
];

function AboutPage() {
	return (
		<>
			<PageHero
				eyebrow="Thomas Habegger"
				title={
					<>
						Koch aus Leidenschaft.
						<br />
						<span className="text-brass-light italic">
							Gastgeber aus Überzeugung.
						</span>
					</>
				}
				intro="Thomas verbindet die Ruhe und Präzision der Spitzenküche mit einer unkomplizierten, persönlichen Zusammenarbeit."
				image="/images/thomas.jpg"
			/>
			<section className="bg-paper py-24 text-night md:py-32">
				<div className="measure">
					<p className="eyebrow text-brass">Haltung</p>
					<blockquote className="display-title mt-8 text-5xl md:text-7xl">
						„Ein gutes Menü beeindruckt. Ein guter Abend bleibt.“
					</blockquote>
					<div className="mt-12 grid gap-8 text-lg leading-relaxed text-night/65 md:grid-cols-2">
						<p>
							Am Anfang steht kein fertiger Katalog, sondern das Gespräch. Wer
							kommt zusammen? Was wird gefeiert? Wie soll sich der Abend
							anfühlen?
						</p>
						<p>
							Daraus entsteht ein Menü mit saisonalen, hochwertigen Zutaten und
							ein Ablauf, der den Gastgebern Raum gibt, selbst Teil ihres
							Anlasses zu sein.
						</p>
					</div>
				</div>
			</section>
			<section className="shell py-24 md:py-32">
				<div className="grid gap-16 lg:grid-cols-[.7fr_1.3fr]">
					<div>
						<p className="eyebrow text-brass">Erfahrung</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							Stationen, die eine Handschrift formen.
						</h2>
					</div>
					<div>
						{experience.map((item) => (
							<article
								key={item.title}
								className="grid gap-3 border-t border-bone/15 py-7 sm:grid-cols-[8rem_1fr]"
							>
								<p className="font-mono text-xs text-brass">{item.year}</p>
								<div>
									<h3 className="font-serif text-3xl">{item.title}</h3>
									<p className="mt-3 max-w-2xl leading-relaxed text-bone/55">
										{item.copy}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
				<div className="mt-20 image-treatment aspect-[16/7]">
					<img
						src="/images/private-dinner.jpg"
						alt="Thomas Habegger beim Service"
					/>
				</div>
				<div className="mt-12 flex flex-wrap items-center justify-between gap-8">
					<p className="max-w-xl text-lg text-bone/55">
						Sie planen einen Anlass und möchten wissen, ob Thomas der richtige
						Koch dafür ist? Ein erstes Gespräch ist unverbindlich.
					</p>
					<Link to="/anfragen" className="button-primary">
						Kennenlernen <ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}
