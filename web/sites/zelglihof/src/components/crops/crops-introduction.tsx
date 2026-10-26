import { m } from "@oliumbi/i18n/messages";

export function CropsIntroduction() {
	return (
		<section className="shell pt-14 md:pt-24">
			<p className="eyebrow text-clay">{m.zelglihof_crops_eyebrow()}</p>
			<div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
				<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-6xl md:text-8xl">
					{m.zelglihof_crops_title()}
				</h1>
				<p className="font-serif text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.3] tracking-[-0.025em] text-ink/70">
					{m.zelglihof_crops_description()}
				</p>
			</div>
		</section>
	);
}
