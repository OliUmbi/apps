import { m } from "@oliumbi/i18n/messages";
import { Leaf, Sprout } from "lucide-react";

const crops = [
	"Zuckerrüben",
	"Getreide",
	"Raps",
	"Speisekürbisse",
	"Spinat",
	"Erbsen",
	"Bohnen",
	"Zuckermais",
	"Broccoli",
];

const cropColors = ["bg-sun/55", "bg-sage/45", "bg-oat"];

export function SeasonalCrops() {
	return (
		<section className="bg-cream py-24 md:py-32">
			<div className="shell">
				<div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p className="eyebrow text-clay">
							{m.zelglihof_farm_crops_eyebrow()}
						</p>
						<h2 className="display-title mt-5 text-5xl md:text-6xl">
							{m.zelglihof_farm_crops_title()}
						</h2>
					</div>
					<div>
						<p className="text-xl leading-relaxed text-ink/60">
							{m.zelglihof_farm_crops_body()}
						</p>
						<div className="mt-10 flex flex-wrap gap-3">
							{crops.map((crop, index) => (
								<span
									key={crop}
									className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${cropColors[index % cropColors.length]}`}
								>
									{index % 2 === 0 ? <Sprout size={15} /> : <Leaf size={15} />}
									{crop}
								</span>
							))}
						</div>
					</div>
				</div>
				<img
					src="/images/demo/demo-saat.jpg"
					alt={m.zelglihof_farm_sowing_alt()}
					className="mt-14 aspect-[16/7] w-full rounded-[2rem] object-cover"
				/>
			</div>
		</section>
	);
}
