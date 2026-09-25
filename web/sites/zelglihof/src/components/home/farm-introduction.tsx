import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Egg, Sprout, Wheat } from "lucide-react";
export function FarmIntroduction() {
	return (
		<section className="shell grid gap-5 py-24 md:grid-cols-[1.15fr_0.85fr] md:py-32">
			<div className="relative min-h-[34rem] overflow-hidden rounded-[2rem]">
				<img
					src="/images/demo/demo-saat.jpg"
					alt={m.zelglihof_home_sowing_alt()}
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
				<p className="absolute bottom-7 left-7 max-w-sm font-serif text-3xl font-bold text-cream md:bottom-10 md:left-10 md:text-4xl">
					{m.zelglihof_home_farm_summary()}
				</p>
			</div>
			<div className="flex flex-col justify-between rounded-[2rem] bg-sun p-7 md:p-10">
				<div>
					<p className="eyebrow">{m.zelglihof_home_family_business()}</p>
					<h2 className="display-title mt-6 text-5xl md:text-6xl">
						{m.zelglihof_home_farm_title()}
					</h2>
					<p className="mt-6 text-lg leading-relaxed text-ink/70">
						{m.zelglihof_home_farm_body()}
					</p>
				</div>
				<div className="mt-12 grid grid-cols-3 gap-3 border-t border-ink/15 pt-6 text-center">
					<div>
						<Egg className="mx-auto" size={24} />
						<p className="mt-2 text-xs font-bold uppercase tracking-wider">
							{m.zelglihof_home_hens()}
						</p>
					</div>
					<div>
						<Wheat className="mx-auto" size={24} />
						<p className="mt-2 text-xs font-bold uppercase tracking-wider">
							{m.zelglihof_home_crops()}
						</p>
					</div>
					<div>
						<Sprout className="mx-auto" size={24} />
						<p className="mt-2 text-xs font-bold uppercase tracking-wider">
							{m.zelglihof_home_seasonal()}
						</p>
					</div>
				</div>
				<Link
					to="/about"
					className="mt-8 inline-flex items-center gap-2 font-bold"
				>
					{m.zelglihof_home_about_farm()}
					<ArrowRight size={17} />
				</Link>
			</div>
		</section>
	);
}
