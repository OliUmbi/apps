import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
export function Hero() {
	return (
		<section className="relative min-h-[92svh] overflow-hidden pt-20">
			<img
				src="/images/private-dinner.jpg"
				alt={m.unclet_home_private_dinner_alt()}
				className="absolute inset-0 size-full object-cover object-center"
			/>
			<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,15,.96)_0%,rgba(17,17,15,.72)_47%,rgba(17,17,15,.18)_100%)]" />
			<div className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] relative z-10 flex min-h-[calc(92svh-5rem)] items-end pb-14 md:items-center md:pb-0">
				<div className="max-w-4xl">
					<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass-light">
						{m.unclet_home_hero_eyebrow()}
					</p>
					<h1 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-6 text-[clamp(4.1rem,10vw,9.5rem)]">
						{m.unclet_home_hero_title()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_home_hero_title_accent()}
						</span>
					</h1>
					<p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/70 md:text-xl">
						{m.unclet_home_hero_description()}
					</p>
					<div className="mt-10 flex flex-wrap gap-3">
						<Link
							to="/inquiry"
							className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light"
						>
							{m.unclet_home_discuss_event()}
							<ArrowRight size={17} />
						</Link>
						<Link
							to="/services"
							className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-bone/28 bg-night/35 px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-bone transition-colors hover:border-brass hover:text-brass-light"
						>
							{m.unclet_home_discover_services()}
						</Link>
					</div>
				</div>
			</div>
			<a
				href="#angebot"
				className="absolute right-5 bottom-8 z-10 hidden items-center gap-3 text-xs tracking-widest text-bone/55 uppercase md:flex"
			>
				{m.unclet_home_explore_format()}
				<ArrowDown size={16} />
			</a>
		</section>
	);
}
