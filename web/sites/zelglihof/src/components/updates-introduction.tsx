import { m } from "@oliumbi/i18n/messages";

export function UpdatesIntroduction() {
	return (
		<section className="shell py-14 md:py-24">
			<p className="eyebrow text-clay">{m.zelglihof_updates_eyebrow()}</p>
			<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
				<h1 className="display-title text-6xl md:text-8xl">
					{m.zelglihof_updates_title()}
				</h1>
				<p className="max-w-xl text-xl leading-relaxed text-ink/60">
					{m.zelglihof_updates_description()}
				</p>
			</div>
		</section>
	);
}
