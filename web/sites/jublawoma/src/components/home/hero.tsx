import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function Hero() {
	return (
		<section className="overflow-hidden bg-oat text-bark">
			<div className="shell grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.1fr_.9fr]">
				<div>
					<p className="kicker">{m.jublawoma_home_hero_eyebrow()}</p>
					<h1 className="my-5 max-w-3xl text-[clamp(3.8rem,8vw,7.8rem)] leading-[.88] font-black tracking-[-.075em]">
						{m.jublawoma_home_hero_title_start()}
						<br />
						{m.jublawoma_home_hero_title_line()}{" "}
						<em className="font-serif font-normal text-moss">
							{m.jublawoma_home_hero_title_emphasis()}
						</em>
					</h1>
					<p className="max-w-2xl text-lg leading-relaxed text-bark/70">
						{m.jublawoma_home_hero_intro()}
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-6">
						<Link to="/join" className="button dark">
							{m.jublawoma_home_hero_primary_action()}
							<ArrowRight size={18} />
						</Link>
						<Link to="/events" className="text-link">
							{m.jublawoma_home_hero_events_action()}
						</Link>
					</div>
				</div>
				<div className="relative min-h-[360px] self-stretch">
					<div className="absolute top-[12%] right-[5%] aspect-square w-4/5 rotate-[-9deg] rounded-[48%_52%_65%_35%/60%_42%_58%_40%] bg-sage/70" />
					<img
						className="absolute inset-0 z-10 h-full w-full object-contain saturate-50"
						src="/assets/images/doodles/swinging.svg"
						alt={m.jublawoma_home_hero_art_alt()}
					/>
				</div>
			</div>
		</section>
	);
}
