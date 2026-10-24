import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function ChefExperience() {
	const experience = [
		{
			period: "2013",
			title: m.unclet_about_gusto_title(),
			body: m.unclet_about_gusto_body(),
		},
		{
			period: "Danach",
			title: m.unclet_about_gstaad_title(),
			body: m.unclet_about_gstaad_body(),
		},
		{
			period: "International",
			title: m.unclet_about_private_chef_title(),
			body: m.unclet_about_private_chef_body(),
		},
		{
			period: "Aargau",
			title: m.unclet_about_catering_title(),
			body: m.unclet_about_catering_body(),
		},
		{
			period: "Seit 2024",
			title: m.unclet_about_founding_title(),
			body: m.unclet_about_founding_body(),
		},
	];

	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] py-24 md:py-32">
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
				<Link
					to="/inquiry"
					className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light"
				>
					{m.unclet_about_contact_action()}
					<ArrowRight size={17} />
				</Link>
			</div>
		</section>
	);
}
