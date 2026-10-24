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
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] py-24 md:py-32">
			<div className="grid gap-12 lg:grid-cols-2">
				<div className="image-treatment min-h-[520px]">
					<img src="/images/buffet.jpg" alt={m.unclet_services_buffet_alt()} />
				</div>
				<div className="flex items-center lg:px-12">
					<div>
						<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
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
						<Link
							to="/inquiry"
							className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light mt-8"
						>
							{m.unclet_services_discuss_event()}
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
