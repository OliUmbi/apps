import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { ProductSummary } from "../../model/content";
export function Hero({
	featuredProduct,
}: {
	featuredProduct?: ProductSummary;
}) {
	return (
		<section className="shell grid gap-5 pt-5 lg:grid-cols-[1.05fr_0.95fr] lg:pt-8">
			<div className="relative flex min-h-[34rem] flex-col justify-between overflow-hidden rounded-[2rem] bg-forest p-7 text-cream md:p-11 lg:min-h-[42rem]">
				<div className="absolute -right-24 -top-20 size-72 rounded-full border border-white/10" />
				<div className="absolute -right-10 top-10 size-44 rounded-full border border-white/10" />
				<p className="eyebrow relative text-sun">
					{m.zelglihof_home_hero_eyebrow()}
				</p>
				<div className="relative">
					<h1 className="display-title max-w-xl text-[clamp(4.2rem,9vw,7.8rem)]">
						{m.zelglihof_home_hero_title()}
						<br />
						<span className="text-sun">
							{m.zelglihof_home_hero_title_accent()}
						</span>
					</h1>
					<p className="mt-7 max-w-md text-base leading-relaxed text-cream/72 md:text-lg">
						{m.zelglihof_home_hero_description()}
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link to="/products" className="button-light">
							{m.zelglihof_home_reserve()}
							<ArrowRight size={17} />
						</Link>
						<Link
							to="/about"
							className="button-secondary border-white/25 text-cream hover:border-white hover:bg-white/10"
						>
							{m.zelglihof_home_discover_farm()}
						</Link>
					</div>
				</div>
				<a
					href="#aktuell"
					className="relative flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-cream/55 hover:text-cream"
				>
					<ArrowDown size={16} />
					{m.zelglihof_home_latest_updates()}
				</a>
			</div>
			<div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] lg:min-h-[42rem]">
				<img
					src="/images/demo/demo-hof.jpg"
					alt={m.zelglihof_home_farm_alt()}
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
				{featuredProduct && (
					<div className="absolute inset-x-5 bottom-5 rounded-[1.35rem] border border-white/20 bg-cream/92 p-5 text-ink shadow-xl backdrop-blur md:inset-x-7 md:bottom-7 md:p-6">
						<div className="flex items-center justify-between gap-4">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
									{m.zelglihof_home_promotion_eyebrow()}
								</p>
								<p className="mt-1 font-serif text-2xl font-bold">
									{featuredProduct.name}
								</p>
							</div>
							<span
								className="size-3 rounded-full bg-moss shadow-[0_0_0_7px_rgba(99,122,82,.16)]"
								aria-hidden="true"
							/>
						</div>
						<p className="mt-3 text-sm leading-relaxed text-ink/65">
							{featuredProduct.description}
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
