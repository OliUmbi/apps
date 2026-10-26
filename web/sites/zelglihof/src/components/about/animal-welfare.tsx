import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Beef } from "lucide-react";
export function AnimalWelfare() {
	return (
		<section className="shell py-24 md:py-32">
			<div className="grid gap-14 lg:grid-cols-2 lg:items-center">
				<div>
					<p className="eyebrow text-moss">
						{m.zelglihof_farm_animals_eyebrow()}
					</p>
					<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 text-5xl md:text-6xl">
						{m.zelglihof_farm_animals_title()}
					</h2>
					<p className="mt-7 font-serif text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.3] tracking-[-0.025em] text-ink/75">
						{m.zelglihof_farm_animals_body()}
					</p>
					<p className="mt-6 text-ink/66 leading-[1.75]">
						{m.zelglihof_farm_animals_housing_body()}
					</p>
					<p className="mt-4 text-ink/66 leading-[1.75]">
						{m.zelglihof_farm_animals_feed_body()}
					</p>
					<Link to="/products" className="cta mt-8">
						{m.zelglihof_farm_beef_action()}
						<ArrowRight size={17} />
					</Link>
				</div>
				<div className="rounded-[2rem] bg-forest p-8 text-cream md:p-12">
					<Beef size={58} strokeWidth={1.2} className="text-sun" />
					<p className="mt-14 font-serif text-4xl font-bold">
						{m.zelglihof_farm_animal_welfare_title()}
					</p>
					<p className="mt-6 leading-relaxed text-cream/65">
						{m.zelglihof_farm_animal_welfare_body()}
					</p>
				</div>
			</div>
			<div className="mt-14 grid gap-8 rounded-[2rem] bg-cream p-8 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:p-12">
				<h3 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-3xl">
					{m.zelglihof_farm_hens_title()}
				</h3>
				<p className="text-ink/66 leading-[1.75]">
					{m.zelglihof_farm_hens_body()}
				</p>
			</div>
		</section>
	);
}
