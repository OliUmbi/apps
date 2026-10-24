import { m } from "@oliumbi/i18n/messages";

export function FarmIntroduction() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] py-14 md:py-24">
			<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-clay">
				{m.zelglihof_farm_eyebrow()}
			</p>
			<div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
				<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-6xl md:text-8xl">
					{m.zelglihof_farm_title()}
				</h1>
				<p className="max-w-xl text-xl leading-relaxed text-ink/60">
					{m.zelglihof_farm_description()}
				</p>
			</div>
			<div className="mt-12 grid gap-8 border-t border-ink/15 pt-10 md:grid-cols-2 md:gap-14">
				<p className="font-serif text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.3] tracking-[-0.025em] text-ink/80">
					{m.zelglihof_farm_history_body()}
				</p>
				<p className="text-ink/66 leading-[1.75] self-end">
					{m.zelglihof_farm_generation_body()}
				</p>
			</div>
		</section>
	);
}
