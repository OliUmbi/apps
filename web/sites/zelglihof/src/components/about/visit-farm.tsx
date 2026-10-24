import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
export function VisitFarm() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] py-24">
			<div className="rounded-[2rem] bg-sun p-8 md:flex md:items-center md:justify-between md:p-12">
				<div>
					<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-['']">
						{m.zelglihof_farm_visit_eyebrow()}
					</p>
					<h2 className="mt-5 font-serif text-4xl font-bold">
						{m.zelglihof_farm_visit_title()}
					</h2>
				</div>
				<Link
					to="/contact"
					className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-transparent bg-forest px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-cream transition hover:-translate-y-0.5 hover:bg-[#172f20] mt-8 md:mt-0"
				>
					{m.zelglihof_farm_directions_contact()}
					<ArrowRight size={17} />
				</Link>
			</div>
		</section>
	);
}
