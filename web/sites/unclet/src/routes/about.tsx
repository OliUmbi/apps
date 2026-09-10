import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: m.unclet_routes_about_title() },
			{
				name: "description",
				content: m.unclet_routes_about_content(),
			},
		],
	}),
	component: AboutPage,
});

const experience = [
	{
		year: "2013",
		title: m.unclet_routes_about_title_2(),
		copy: m.unclet_routes_about_copy(),
	},
	{
		year: "Danach",
		title: m.unclet_routes_about_title_3(),
		copy: m.unclet_routes_about_copy_2(),
	},
	{
		year: "International",
		title: m.unclet_routes_about_title_4(),
		copy: m.unclet_routes_about_copy_3(),
	},
	{
		year: "Aargau",
		title: m.unclet_routes_about_title_5(),
		copy: m.unclet_routes_about_copy_4(),
	},
	{
		year: "Seit 2024",
		title: m.unclet_routes_about_title_6(),
		copy: m.unclet_routes_about_copy_5(),
	},
];

function AboutPage() {
	return (
		<>
			<PageHero
				eyebrow={m.unclet_routes_about_eyebrow()}
				title={
					<>
						{m.unclet_routes_about_text()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_routes_about_text_2()}
						</span>
					</>
				}
				intro={m.unclet_routes_about_intro()}
				image="/images/thomas.jpg"
			/>
			<section className="bg-paper py-24 text-night md:py-32">
				<div className="measure">
					<p className="eyebrow text-brass">
						{m.unclet_routes_about_paragraph()}
					</p>
					<blockquote className="display-title mt-8 text-5xl md:text-7xl">
						{m.unclet_routes_about_text_3()}
					</blockquote>
					<div className="mt-12 grid gap-8 text-lg leading-relaxed text-night/65 md:grid-cols-2">
						<p>{m.unclet_routes_about_paragraph_2()}</p>
						<p>{m.unclet_routes_about_paragraph_3()}</p>
					</div>
				</div>
			</section>
			<section className="shell py-24 md:py-32">
				<div className="grid gap-16 lg:grid-cols-[.7fr_1.3fr]">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_routes_about_paragraph_4()}
						</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							{m.unclet_routes_about_heading()}
						</h2>
					</div>
					<div>
						{experience.map((item) => (
							<article
								key={item.title}
								className="grid gap-3 border-t border-bone/15 py-7 sm:grid-cols-[8rem_1fr]"
							>
								<p className="font-mono text-xs text-brass">{item.year}</p>
								<div>
									<h3 className="font-serif text-3xl">{item.title}</h3>
									<p className="mt-3 max-w-2xl leading-relaxed text-bone/55">
										{item.copy}
									</p>
								</div>
							</article>
						))}
					</div>
				</div>
				<div className="mt-20 image-treatment aspect-[16/7]">
					<img
						src="/images/private-dinner.jpg"
						alt={m.unclet_routes_about_alt()}
					/>
				</div>
				<div className="mt-12 flex flex-wrap items-center justify-between gap-8">
					<p className="max-w-xl text-lg text-bone/55">
						{m.unclet_routes_about_paragraph_5()}
					</p>
					<Link to="/inquiry" className="button-primary">
						{m.unclet_routes_about_text_4()}
						<ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}
