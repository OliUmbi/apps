import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function EventPlanning() {
	// Messages resolve per render; module scope would bake one locale in (U-20).
	const steps = [
		[m.unclet_services_step_meet_title(), m.unclet_services_step_meet_body()],
		[
			m.unclet_services_step_concept_title(),
			m.unclet_services_step_concept_body(),
		],
		[
			m.unclet_services_step_prepare_title(),
			m.unclet_services_step_prepare_body(),
		],
		[m.unclet_services_step_host_title(), m.unclet_services_step_host_body()],
	] as const;

	return (
		<section className="shell py-24 md:py-32">
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
						<Link to="/inquiry" className="cta mt-8">
							{m.unclet_services_discuss_event()}
							<ArrowRight size={17} aria-hidden="true" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
