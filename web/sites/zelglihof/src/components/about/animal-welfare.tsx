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
					<h2 className="display-title mt-5 text-5xl md:text-6xl">
						{m.zelglihof_farm_animals_title()}
					</h2>
					<p className="mt-7 text-lg leading-relaxed text-ink/65">
						{m.zelglihof_farm_animals_body()}
					</p>
					<Link to="/products" className="button-primary mt-8">
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
		</section>
	);
}
