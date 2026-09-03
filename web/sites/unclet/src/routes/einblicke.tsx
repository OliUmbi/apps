import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/einblicke")({
	head: () => ({ meta: [{ title: "Einblicke · Uncle-T" }] }),
	component: InsightsPage,
});

const gallery = [
	{
		image: "/images/private-dinner.jpg",
		title: "Private Dining",
		copy: "Persönlicher Service direkt am Tisch.",
	},
	{
		image: "/images/plating.jpg",
		title: "Handwerk",
		copy: "Frisch zubereitet und präzise angerichtet.",
	},
	{
		image: "/images/event-table.jpg",
		title: "Catering",
		copy: "Ein Ablauf, der sich natürlich in den Anlass fügt.",
	},
	{
		image: "/images/fire.jpg",
		title: "Feuer & Grill",
		copy: "Unmittelbar, gesellig und voller Geschmack.",
	},
	{
		image: "/images/buffet.jpg",
		title: "Buffet",
		copy: "Grosszügig gedacht, sorgfältig umgesetzt.",
	},
	{
		image: "/images/coal.jpg",
		title: "Details",
		copy: "Die kleinen Entscheidungen machen den Unterschied.",
	},
];

function InsightsPage() {
	return (
		<>
			<PageHero
				eyebrow="Einblicke"
				title={
					<>
						Essen schafft
						<br />
						<span className="text-brass-light italic">Erinnerungen.</span>
					</>
				}
				intro="Eine Auswahl aus Küche, Service und vergangenen Formaten. Die konkreten Menüs entstehen immer neu im Gespräch."
			/>
			<section className="shell py-20 md:py-28">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{gallery.map((item, index) => (
						<article
							key={item.title}
							className={
								index === 0 || index === 5 ? "sm:col-span-2 lg:col-span-2" : ""
							}
						>
							<div className="image-treatment aspect-[4/3]">
								<img src={item.image} alt={item.title} />
							</div>
							<div className="flex items-start justify-between border-b border-bone/15 py-5">
								<div>
									<h2 className="font-serif text-2xl">{item.title}</h2>
									<p className="mt-2 text-sm text-bone/50">{item.copy}</p>
								</div>
								<span className="font-mono text-xs text-brass">
									0{index + 1}
								</span>
							</div>
						</article>
					))}
				</div>
				<div className="mt-20 border border-brass/35 p-8 md:flex md:items-center md:justify-between md:p-12">
					<div>
						<p className="eyebrow text-brass">Ihre Idee fehlt noch</p>
						<h2 className="display-title mt-4 text-4xl md:text-5xl">
							Welcher Anlass wird Ihrer?
						</h2>
					</div>
					<Link to="/anfragen" className="button-primary mt-8 md:mt-0">
						Anfrage starten <ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}
