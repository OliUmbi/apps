import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const services = [
	{
		name: "Saat",
		text: "Präzise Aussaat mit moderner Technik – abgestimmt auf Kultur, Boden und Bedingungen.",
		image: "/images/demo/demo-saat.jpg",
	},
	{
		name: "Pflanzenschutz",
		text: "Gezielte Arbeiten im Feld mit Erfahrung, Sorgfalt und dem Blick für den richtigen Zeitpunkt.",
		image: "/images/demo/demo-pflanzenschutz.jpg",
	},
	{
		name: "Winterdienst",
		text: "Zuverlässige Räumung und Unterstützung, wenn Schnee und Eis den Alltag bestimmen.",
		image: "/images/demo/demo-winterdienst.jpg",
	},
];

export function ServicesPage() {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">Dienstleistungen</p>
				<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
					<h1 className="display-title text-6xl md:text-8xl">
						Technik, die anpackt.
					</h1>
					<p className="max-w-xl text-xl leading-relaxed text-ink/60">
						Ausgewählte landwirtschaftliche Arbeiten für Betriebe und Umgebung –
						je nach Saison, Bedingungen und verfügbarer Kapazität.
					</p>
				</div>
			</section>
			<section className="shell grid gap-6 pb-24">
				{services.map((service, index) => (
					<article
						key={service.name}
						className="grid overflow-hidden rounded-[2rem] bg-cream md:grid-cols-2"
					>
						<img
							src={service.image}
							alt=""
							className={`min-h-72 h-full w-full object-cover ${index % 2 ? "md:order-2" : ""}`}
						/>
						<div className="flex flex-col justify-between p-7 md:p-10">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
									0{index + 1}
								</p>
								<h2 className="mt-4 font-serif text-5xl font-bold">
									{service.name}
								</h2>
								<p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/60">
									{service.text}
								</p>
							</div>
							<Link
								to="/kontakt"
								className="mt-10 inline-flex items-center gap-2 font-bold"
							>
								Verfügbarkeit anfragen <ArrowRight size={18} />
							</Link>
						</div>
					</article>
				))}
			</section>
		</>
	);
}
