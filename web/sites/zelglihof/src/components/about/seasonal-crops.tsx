import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Sprout } from "lucide-react";

const crops = [
	"Zuckerrüben",
	"Raps",
	"Weizen",
	"Dinkel",
	"Futtermais",
	"Kürbisse",
	"Spinat",
	"Erbsen",
	"Bohnen",
	"Zuckermais",
	"Brokkoli",
];

const cropColors = ["bg-sun/55", "bg-sage/45", "bg-oat"];

export function SeasonalCrops() {
	return (
		<section className="bg-cream py-24 md:py-32">
			<div className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)]">
				<div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
					<div>
						<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-clay">
							{m.zelglihof_farm_crops_eyebrow()}
						</p>
						<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 text-5xl md:text-6xl">
							{m.zelglihof_farm_crops_title()}
						</h2>
					</div>
					<div>
						<p className="font-serif text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.3] tracking-[-0.025em] text-ink/70">
							{m.zelglihof_farm_crops_body()}
						</p>
						<div className="mt-9 flex flex-wrap gap-3">
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
						<Link
							to="/crops"
							className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-forest/35 bg-transparent px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-forest transition hover:border-forest hover:bg-white/35 mt-9"
						>
							{m.zelglihof_farm_crops_action()}
							<ArrowRight size={17} />
						</Link>
					</div>
				</div>
				<img
					src="/images/zuckermais-mulchfeld.jpg"
					alt={m.zelglihof_farm_sowing_alt()}
					className="mt-14 aspect-[16/7] w-full rounded-[2rem] object-cover"
				/>
			</div>
		</section>
	);
}
