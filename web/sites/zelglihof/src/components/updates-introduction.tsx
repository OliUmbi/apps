import { m } from "@oliumbi/i18n/messages";

export function UpdatesIntroduction() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] py-14 md:py-24">
			<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-clay">
				{m.zelglihof_updates_eyebrow()}
			</p>
			<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
				<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-6xl md:text-8xl">
					{m.zelglihof_updates_title()}
				</h1>
				<p className="max-w-xl text-xl leading-relaxed text-ink/60">
					{m.zelglihof_updates_description()}
				</p>
			</div>
		</section>
	);
}
