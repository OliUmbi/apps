import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
export function ShowcasePreview() {
	return (
		<section className="shell py-24 md:py-36">
			<div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
				<div>
					<p className="eyebrow text-brass">
						{m.unclet_home_showcases_eyebrow()}
					</p>
					<h2 className="display-title mt-6 text-5xl md:text-7xl">
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
			<Link to="/showcases" className="button-secondary mt-10">
				{m.unclet_home_all_showcases()}
				<ArrowRight size={16} />
			</Link>
		</section>
	);
}
