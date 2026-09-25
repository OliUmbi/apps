import { m } from "@oliumbi/i18n/messages";
import { Beef, Bird, Wheat } from "lucide-react";
import type { ReactNode } from "react";
export function FarmFacts() {
	return (
		<section className="shell grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
			<div className="relative min-h-[38rem] overflow-hidden rounded-[2rem]">
				<img
					src="/images/demo/demo-hof.jpg"
					alt={m.zelglihof_farm_landscape_alt()}
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
				<p className="absolute bottom-8 left-8 max-w-lg font-serif text-4xl font-bold text-cream md:bottom-11 md:left-11 md:text-5xl">
					{m.zelglihof_farm_family_business()}
				</p>
			</div>
			<div className="grid gap-5">
				<FarmFact
					icon={<Beef />}
					value="F1"
					label={m.zelglihof_farm_cattle_breeds()}
					color="bg-clay text-cream"
				/>
				<FarmFact
					icon={<Bird />}
					value="frisch"
					label={m.zelglihof_farm_fresh_eggs()}
					color="bg-sun text-ink"
				/>
				<FarmFact
					icon={<Wheat />}
					value="ÖLN"
					label={m.zelglihof_farm_farming_standards()}
					color="bg-sage text-ink"
				/>
			</div>
		</section>
	);
}

function FarmFact({
	icon,
	value,
	label,
	color,
}: {
	icon: ReactNode;
	value: string;
	label: string;
	color: string;
}) {
	return (
		<div
			className={`flex min-h-44 flex-col justify-between rounded-[2rem] p-7 ${color}`}
		>
			<div className="flex items-start justify-between gap-4">
				<span className="font-serif text-5xl font-bold">{value}</span>
				{icon}
			</div>
			<p className="max-w-xs text-sm font-semibold leading-relaxed opacity-75">
				{label}
			</p>
		</div>
	);
}
