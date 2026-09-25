import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
export function ServiceFormats() {
	const formats = [
		{
			number: "01",
			title: m.unclet_home_private_dinner_title(),
			body: m.unclet_home_private_dinner_body(),
		},
		{
			number: "02",
			title: m.unclet_home_celebrations_title(),
			body: m.unclet_home_celebrations_body(),
		},
		{
			number: "03",
			title: m.unclet_home_business_events_title(),
			body: m.unclet_home_business_events_body(),
		},
	];

	return (
		<section id="angebot" className="bg-paper py-24 text-night md:py-36">
			<div className="shell">
				<div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end">
					<p className="eyebrow text-brass">
						{m.unclet_home_services_eyebrow()}
					</p>
					<h2 className="display-title text-5xl md:text-7xl">
						{m.unclet_home_services_title()}
						<br />
						{m.unclet_home_services_title_accent()}
					</h2>
				</div>
				<div className="mt-16 grid border-t border-night/15 md:grid-cols-3">
					{formats.map((format) => (
						<article
							key={format.number}
							className="border-b border-night/15 py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
						>
							<span className="font-mono text-xs text-brass">
								{format.number}
							</span>
							<h3 className="mt-10 font-serif text-3xl">{format.title}</h3>
							<p className="mt-4 leading-relaxed text-night/60">
								{format.body}
							</p>
						</article>
					))}
				</div>
				<Link
					to="/services"
					className="mt-10 inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase hover:text-brass"
				>
					{m.unclet_home_planning_action()}
					<ArrowRight size={16} />
				</Link>
			</div>
		</section>
	);
}
