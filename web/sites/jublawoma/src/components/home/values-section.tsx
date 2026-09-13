import { m } from "@oliumbi/i18n/messages";

const values = [
	{
		number: "01",
		title: m.jublawoma_value_together_title,
		copy: m.jublawoma_value_together_copy,
		art: "dog.svg",
	},
	{
		number: "02",
		title: m.jublawoma_value_participate_title,
		copy: m.jublawoma_value_participate_copy,
		art: "float.svg",
	},
	{
		number: "03",
		title: m.jublawoma_value_faith_title,
		copy: m.jublawoma_value_faith_copy,
		art: "meditating.svg",
	},
	{
		number: "04",
		title: m.jublawoma_value_creative_title,
		copy: m.jublawoma_value_creative_copy,
		art: "messy.svg",
	},
	{
		number: "05",
		title: m.jublawoma_value_nature_title,
		copy: m.jublawoma_value_nature_copy,
		art: "plant.svg",
	},
] as const;

export function ValuesSection() {
	return (
		<section className="shell py-24 lg:py-36">
			<div className="grid items-end gap-4 md:grid-cols-[1fr_2fr]">
				<p className="kicker">{m.jublawoma_home_values_eyebrow()}</p>
				<h2 className="m-0 text-[clamp(2.6rem,5vw,5.3rem)] leading-[.95] tracking-[-.06em]">
					{m.jublawoma_home_values_title()}
					<br />
					<span className="font-serif font-normal text-moss italic">
						{m.jublawoma_home_values_title_accent()}
					</span>
				</h2>
			</div>
			<div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
				{values.map((value, index) => (
					<article
						className={`relative min-h-[28rem] overflow-hidden rounded-3xl border border-bark/15 p-6 ${index < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}
						key={value.number}
					>
						<span className="text-xs font-black">{value.number}</span>
						<img
							className="h-60 w-full object-contain saturate-50"
							src={`/assets/images/doodles/${value.art}`}
							alt=""
						/>
						<h3 className="mt-5 mb-2 text-2xl font-bold">{value.title()}</h3>
						<p className="leading-relaxed text-bark/65">{value.copy()}</p>
					</article>
				))}
			</div>
		</section>
	);
}
