import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function ChefExperience() {
	// Messages resolve per render; module scope would bake one locale in (U-20).
	const experience = [
		{
			period: m.unclet_about_period_gusto(),
			title: m.unclet_about_gusto_title(),
			body: m.unclet_about_gusto_body(),
		},
		{
			period: m.unclet_about_period_gstaad(),
			title: m.unclet_about_gstaad_title(),
			body: m.unclet_about_gstaad_body(),
		},
		{
			period: m.unclet_about_period_private_chef(),
			title: m.unclet_about_private_chef_title(),
			body: m.unclet_about_private_chef_body(),
		},
		{
			period: m.unclet_about_period_catering(),
			title: m.unclet_about_catering_title(),
			body: m.unclet_about_catering_body(),
		},
		{
			period: m.unclet_about_period_founding(),
			title: m.unclet_about_founding_title(),
			body: m.unclet_about_founding_body(),
		},
	];

	return (
		<section className="shell py-24 md:py-32">
			<div className="grid gap-16 lg:grid-cols-[.7fr_1.3fr]">
				<div>
					<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
						{m.unclet_about_experience_eyebrow()}
					</p>
					<h2 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-6 text-5xl md:text-7xl">
						{m.unclet_about_experience_title()}
					</h2>
				</div>
				<div>
					{experience.map((item) => (
						<article
							key={item.title}
							className="grid gap-3 border-t border-bone/15 py-7 sm:grid-cols-[8rem_1fr]"
						>
							<p className="font-mono text-xs text-brass">{item.period}</p>
							<div>
								<h3 className="font-serif text-3xl">{item.title}</h3>
								<p className="mt-3 max-w-2xl leading-relaxed text-bone/55">
									{item.body}
								</p>
							</div>
						</article>
					))}
				</div>
			</div>
			<div className="mt-20 image-treatment aspect-[16/7]">
				<img
					src="/images/private-dinner.jpg"
					alt={m.unclet_about_chef_serving_alt()}
				/>
			</div>
			<div className="mt-12 flex flex-wrap items-center justify-between gap-8">
				<p className="max-w-xl text-lg text-bone/55">
					{m.unclet_about_contact_description()}
				</p>
				<Link to="/inquiry" className="cta">
					{m.unclet_about_contact_action()}
					<ArrowRight size={17} aria-hidden="true" />
				</Link>
			</div>
		</section>
	);
}
