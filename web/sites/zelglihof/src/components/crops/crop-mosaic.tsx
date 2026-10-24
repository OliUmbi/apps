import { m } from "@oliumbi/i18n/messages";

type Crop = {
	name: string;
	body: string;
	image?: string;
	tone?: string;
	wide?: boolean;
};

const arable: Crop[] = [
	{
		name: m.zelglihof_crops_corn_name(),
		body: m.zelglihof_crops_corn_body(),
		image: "/images/zuckermais-beregnung-sprenger.jpg",
		wide: true,
	},
	{
		name: m.zelglihof_crops_rapeseed_name(),
		body: m.zelglihof_crops_rapeseed_body(),
		tone: "bg-sun text-ink",
	},
	{
		name: m.zelglihof_crops_wheat_name(),
		body: m.zelglihof_crops_wheat_body(),
		tone: "bg-oat text-ink",
	},
	{
		name: m.zelglihof_crops_spelt_name(),
		body: m.zelglihof_crops_spelt_body(),
		tone: "bg-sage text-ink",
	},
	{
		name: m.zelglihof_crops_beets_name(),
		body: m.zelglihof_crops_beets_body(),
		tone: "bg-clay text-cream",
	},
];

const special: Crop[] = [
	{
		name: m.zelglihof_crops_maize_name(),
		body: m.zelglihof_crops_maize_body(),
		image: "/images/zuckermais-beregnung-haspel.jpg",
	},
	{
		name: m.zelglihof_crops_spinach_name(),
		body: m.zelglihof_crops_spinach_body(),
		image: "/images/spinat-feld.jpg",
	},
	{
		name: m.zelglihof_crops_broccoli_name(),
		body: m.zelglihof_crops_broccoli_body(),
		image: "/images/broccoli-pflanze.jpg",
	},
	{
		name: m.zelglihof_crops_beans_name(),
		body: m.zelglihof_crops_beans_body(),
		tone: "bg-moss text-cream",
	},
	{
		name: m.zelglihof_crops_peas_name(),
		body: m.zelglihof_crops_peas_body(),
		tone: "bg-sage text-ink",
	},
	{
		name: m.zelglihof_crops_pumpkin_name(),
		body: m.zelglihof_crops_pumpkin_body(),
		tone: "bg-sun text-ink",
	},
];

export function CropMosaic() {
	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] pb-24 md:pb-32">
			<CropGroup title={m.zelglihof_crops_group_arable()} crops={arable} />
			<div className="my-16 overflow-hidden rounded-[2rem] md:my-24">
				<img
					src="/images/broccoli-ernte-kiste.jpg"
					alt={m.zelglihof_crops_harvest_alt()}
					className="aspect-[16/6] w-full object-cover"
				/>
			</div>
			<CropGroup title={m.zelglihof_crops_group_special()} crops={special} />
		</section>
	);
}

function CropGroup({ title, crops }: { title: string; crops: Crop[] }) {
	return (
		<div>
			<div className="flex items-center gap-5">
				<h2 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-2xl">
					{title}
				</h2>
				<span className="h-px flex-1 bg-ink/15" aria-hidden="true" />
			</div>
			<div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{crops.map((crop) => (
					<CropTile key={crop.name} crop={crop} />
				))}
			</div>
		</div>
	);
}

function CropTile({ crop }: { crop: Crop }) {
	const wide = crop.wide ? "tile-media--wide lg:col-span-2" : "";
	if (crop.image)
		return (
			<article className={`tile-media ${wide}`}>
				<img src={crop.image} alt={crop.name} />
				<h3 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-2xl text-cream">
					{crop.name}
				</h3>
				<p className="mt-2 max-w-md text-sm leading-relaxed text-cream/75">
					{crop.body}
				</p>
			</article>
		);
	return (
		<article
			className={`flex aspect-[4/5] flex-col justify-end rounded-[1.5rem] p-[1.35rem] ${crop.tone ?? "bg-oat text-ink"}`}
		>
			<h3 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-2xl">
				{crop.name}
			</h3>
			<p className="mt-2 text-sm leading-relaxed opacity-75">{crop.body}</p>
		</article>
	);
}
