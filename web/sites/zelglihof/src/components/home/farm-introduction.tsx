import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Egg, Sprout, Wheat } from "lucide-react";
import { StaticImage } from "../static-image";

// Owner-confirmed farm facts (2026-11): 60 Freilandhühner and 11 Kulturen.
// "Seit 1906" comes from the farm history block.
export function FarmIntroduction() {
	return (
		<section className="shell grid gap-5 py-24 md:grid-cols-[1.15fr_0.85fr] md:py-32">
			<div className="grid gap-4 md:min-h-[34rem] md:grid-rows-[1.05fr_0.95fr]">
				<div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] md:aspect-auto">
					<StaticImage
						name="traktor-feld"
						alt={m.zelglihof_home_tractor_alt()}
						sizes="(min-width: 768px) 58vw, 100vw"
						className="absolute inset-0 h-full w-full object-cover"
					/>
				</div>
				<div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] md:aspect-auto">
					<StaticImage
						name="rinder-herde"
						alt={m.zelglihof_home_cattle_alt()}
						sizes="(min-width: 768px) 58vw, 100vw"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" />
					<p className="absolute bottom-6 left-6 max-w-sm font-serif text-2xl font-bold text-cream md:bottom-8 md:left-8 md:text-3xl">
						{m.zelglihof_home_farm_summary()}
					</p>
				</div>
			</div>
			<div className="flex flex-col justify-between rounded-[2rem] bg-sun p-7 md:p-10">
				<div>
					<p className="eyebrow">{m.zelglihof_home_family_business()}</p>
					<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-6 text-4xl md:text-5xl">
						{m.zelglihof_home_farm_title()}
					</h2>
					<p className="mt-6 text-balance text-lg leading-relaxed text-ink/70">
						{m.zelglihof_home_farm_body()}
					</p>
				</div>
				<div className="mt-12 grid grid-cols-3 gap-3 border-t border-ink/15 pt-6 text-center">
					<div>
						<Egg className="mx-auto" size={24} aria-hidden="true" />
						<p className="mt-2 text-xs font-bold uppercase tracking-wider">
							{m.zelglihof_home_fact_hens()}
						</p>
					</div>
					<div>
						<Wheat className="mx-auto" size={24} aria-hidden="true" />
						<p className="mt-2 text-xs font-bold uppercase tracking-wider">
							{m.zelglihof_home_fact_crops()}
						</p>
					</div>
					<div>
						<Sprout className="mx-auto" size={24} aria-hidden="true" />
						<p className="mt-2 text-xs font-bold uppercase tracking-wider">
							{m.zelglihof_home_fact_since()}
						</p>
					</div>
				</div>
				<div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
					<Link
						to="/about"
						className="inline-flex items-center gap-2 font-bold"
					>
						{m.zelglihof_home_about_farm()}
						<ArrowRight size={17} aria-hidden="true" />
					</Link>
					<Link
						to="/crops"
						className="inline-flex items-center gap-2 font-bold text-ink/65 hover:text-ink"
					>
						{m.zelglihof_farm_crops_action()}
						<ArrowRight size={17} aria-hidden="true" />
					</Link>
				</div>
			</div>
		</section>
	);
}
