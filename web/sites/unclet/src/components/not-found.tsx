import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] relative grid min-h-[78vh] place-items-center overflow-hidden pt-28 text-center">
			<span className="pointer-events-none absolute text-[clamp(14rem,38vw,34rem)] font-bold leading-none text-bone/[0.025]">
				404
			</span>
			<div className="relative z-10 max-w-3xl">
				<p className="font-mono text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-brass">
					{m.unclet_not_found_eyebrow()}
				</p>
				<h1 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] mt-6 text-6xl md:text-8xl">
					{m.unclet_not_found_title()}
				</h1>
				<p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-bone/55">
					{m.unclet_not_found_description()}
				</p>
				<Link
					to="/"
					className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light mt-10"
				>
					<ArrowLeft size={17} aria-hidden="true" />
					{m.back_to_home()}
				</Link>
			</div>
		</section>
	);
}
