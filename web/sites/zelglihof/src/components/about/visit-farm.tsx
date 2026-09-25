import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
export function VisitFarm() {
	return (
		<section className="shell py-24">
			<div className="rounded-[2rem] bg-sun p-8 md:flex md:items-center md:justify-between md:p-12">
				<div>
					<p className="eyebrow">{m.zelglihof_farm_visit_eyebrow()}</p>
					<h2 className="mt-5 font-serif text-4xl font-bold">
						{m.zelglihof_farm_visit_title()}
					</h2>
				</div>
				<Link to="/contact" className="button-primary mt-8 md:mt-0">
					{m.zelglihof_farm_directions_contact()}
					<ArrowRight size={17} />
				</Link>
			</div>
		</section>
	);
}
