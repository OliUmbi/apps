import { m } from "@oliumbi/i18n/messages";

export function FarmIntroduction() {
	return (
		<section className="shell py-14 md:py-24">
			<p className="eyebrow text-clay">{m.zelglihof_farm_eyebrow()}</p>
			<div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
				<h1 className="display-title text-6xl md:text-8xl">
					{m.zelglihof_farm_title()}
				</h1>
				<p className="max-w-xl text-xl leading-relaxed text-ink/60">
					{m.zelglihof_farm_description()}
				</p>
			</div>
		</section>
	);
}
