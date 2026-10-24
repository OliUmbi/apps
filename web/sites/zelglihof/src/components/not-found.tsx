import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Sprout } from "lucide-react";

export function NotFound() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] grid min-h-[72vh] place-items-center py-24 text-center">
			<div className="max-w-3xl">
				<span className="mx-auto grid size-16 place-items-center rounded-full bg-sage/55 text-forest">
					<Sprout size={28} aria-hidden="true" />
				</span>
				<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] mt-8 text-clay">
					{m.zelglihof_not_found_eyebrow()}
				</p>
				<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mx-auto mt-6 max-w-2xl text-6xl md:text-8xl">
					{m.zelglihof_not_found_title()}
				</h1>
				<p className="mx-auto mt-6 max-w-lg text-lg text-ink/60">
					{m.zelglihof_not_found_description()}
				</p>
				<Link
					to="/"
					className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-transparent bg-forest px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-cream transition hover:-translate-y-0.5 hover:bg-[#172f20] mt-8"
				>
					<ArrowLeft size={17} aria-hidden="true" />
					{m.zelglihof_back_to_home()}
				</Link>
			</div>
		</section>
	);
}
