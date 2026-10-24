import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
export function ShowcasePreview() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] py-24 md:py-36">
			<div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
				<div>
					<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
						{m.unclet_home_showcases_eyebrow()}
					</p>
					<h2 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-6 text-5xl md:text-7xl">
						{m.unclet_home_showcases_title()}
					</h2>
				</div>
				<p className="max-w-md leading-relaxed text-bone/55 md:justify-self-end">
					{m.unclet_home_showcases_description()}
				</p>
			</div>
			<div className="mt-14 grid auto-rows-[280px] gap-3 md:grid-cols-12">
				<div className="image-treatment md:col-span-7 md:row-span-2">
					<img
						src="/images/event-table.jpg"
						alt={m.unclet_home_table_setting_alt()}
					/>
				</div>
				<div className="image-treatment md:col-span-5">
					<img src="/images/plating.jpg" alt={m.unclet_home_pasta_alt()} />
				</div>
				<div className="image-treatment md:col-span-5">
					<img src="/images/fire.jpg" alt={m.unclet_home_open_fire_alt()} />
				</div>
			</div>
			<Link
				to="/showcases"
				className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-bone/28 bg-night/35 px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-bone transition-colors hover:border-brass hover:text-brass-light mt-10"
			>
				{m.unclet_home_all_showcases()}
				<ArrowRight size={16} />
			</Link>
		</section>
	);
}
