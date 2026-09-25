import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function EventPlanning() {
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

	return (
		<section className="shell py-24 md:py-32">
			<div className="grid gap-12 lg:grid-cols-2">
				<div className="image-treatment min-h-[520px]">
					<img src="/images/buffet.jpg" alt={m.unclet_services_buffet_alt()} />
				</div>
				<div className="flex items-center lg:px-12">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_services_planning_title()}
						</p>
						<div className="mt-10">
							{steps.map(([title, body], index) => (
								<div
									key={title}
									className="grid grid-cols-[3rem_1fr] gap-4 border-t border-bone/15 py-6"
								>
									<span className="font-mono text-xs text-brass">
										0{index + 1}
									</span>
									<div>
										<h3 className="font-serif text-2xl">{title}</h3>
										<p className="mt-2 leading-relaxed text-bone/55">{body}</p>
									</div>
								</div>
							))}
						</div>
						<Link to="/inquiry" className="button-primary mt-8">
							{m.unclet_services_discuss_event()}
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
