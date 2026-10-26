import { m } from "@oliumbi/i18n/messages";

// Owner item "real farm facts and crop list": these counts are placeholder
// content until the farm confirms the real numbers.
const counts = [
	{
		value: "45",
		label: m.zelglihof_farm_count_cows,
		note: m.zelglihof_farm_count_cows_note,
	},
	{
		value: "18",
		label: m.zelglihof_farm_count_cattle,
		note: m.zelglihof_farm_count_cattle_note,
	},
	{
		value: "22",
		label: m.zelglihof_farm_count_calves,
		note: m.zelglihof_farm_count_calves_note,
	},
	{
		value: "60",
		label: m.zelglihof_farm_count_hens,
		note: m.zelglihof_farm_count_hens_note,
	},
];

export function FarmFacts() {
	return (
		<section className="shell grid gap-5 pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:pb-32">
			<div className="relative min-h-[32rem] overflow-hidden rounded-[2rem] lg:min-h-[38rem]">
				<img
					src="/images/rinder-herde.jpg"
					alt={m.zelglihof_farm_landscape_alt()}
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-transparent to-transparent" />
				<p className="absolute bottom-8 left-8 max-w-lg font-serif text-4xl font-bold text-cream md:bottom-11 md:left-11 md:text-5xl">
					{m.zelglihof_farm_family_business()}
				</p>
			</div>
			<div className="flex flex-col justify-between gap-10 rounded-[2rem] bg-forest p-8 text-cream md:p-10">
				<div>
					<p className="eyebrow text-sun">
						{m.zelglihof_farm_counts_eyebrow()}
					</p>
					<p className="mt-5 max-w-xs text-sm leading-relaxed text-cream/65">
						{m.zelglihof_farm_farming_standards()}
					</p>
				</div>
				<dl className="grid grid-cols-2 gap-x-6 gap-y-8">
					{counts.map((count) => (
						<div key={count.value} className="border-t border-cream/20 pt-4">
							<dd className="font-serif font-bold leading-[0.84] tracking-[-0.05em] text-4xl md:text-5xl">
								{count.value}
							</dd>
							<dt className="mt-2.5 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-cream/70">
								{count.label()}
							</dt>
							<p className="mt-1.5 text-xs leading-relaxed text-cream/50">
								{count.note()}
							</p>
						</div>
					))}
				</dl>
			</div>
		</section>
	);
}
