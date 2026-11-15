import { m } from "@oliumbi/i18n/messages";

type Crop = {
	name: string;
	body: string;
	season: string;
	image?: string;
	imageAlt?: string;
	tone?: string;
	wide?: boolean;
};

// Messages resolve at render time, never at module scope.
function arableCrops(): Crop[] {
	return [
		{
			name: m.zelglihof_crops_corn_name(),
			body: m.zelglihof_crops_corn_body(),
			season: m.zelglihof_season_summer_autumn(),
			tone: "bg-forest text-cream",
			wide: true,
		},
		{
			name: m.zelglihof_crops_rapeseed_name(),
			body: m.zelglihof_crops_rapeseed_body(),
			season: m.zelglihof_season_spring(),
			tone: "bg-sun text-ink",
		},
		{
			name: m.zelglihof_crops_wheat_name(),
			body: m.zelglihof_crops_wheat_body(),
			season: m.zelglihof_season_summer(),
			tone: "bg-oat text-ink",
		},
		{
			name: m.zelglihof_crops_spelt_name(),
			body: m.zelglihof_crops_spelt_body(),
			season: m.zelglihof_season_summer(),
			tone: "bg-sage text-ink",
		},
		{
			name: m.zelglihof_crops_beets_name(),
			body: m.zelglihof_crops_beets_body(),
			season: m.zelglihof_season_autumn(),
			tone: "bg-clay text-cream",
		},
	];
}

function specialCrops(): Crop[] {
	return [
		{
			name: m.zelglihof_crops_maize_name(),
			body: m.zelglihof_crops_maize_body(),
			season: m.zelglihof_season_summer(),
			image: "/images/zuckermais-mulchfolie.jpg",
			imageAlt: m.zelglihof_crops_maize_alt(),
		},
		{
			name: m.zelglihof_crops_spinach_name(),
			body: m.zelglihof_crops_spinach_body(),
			season: m.zelglihof_season_spring_autumn(),
			image: "/images/spinat-feld.jpg",
			imageAlt: m.zelglihof_crops_spinach_alt(),
		},
		{
			name: m.zelglihof_crops_broccoli_name(),
			body: m.zelglihof_crops_broccoli_body(),
			season: m.zelglihof_season_summer_autumn(),
			image: "/images/broccoli-pflanze.jpg",
			imageAlt: m.zelglihof_crops_broccoli_alt(),
		},
		{
			name: m.zelglihof_crops_beans_name(),
			body: m.zelglihof_crops_beans_body(),
			season: m.zelglihof_season_summer(),
			tone: "bg-moss text-cream",
		},
		{
			name: m.zelglihof_crops_peas_name(),
			body: m.zelglihof_crops_peas_body(),
			season: m.zelglihof_season_early_summer(),
			tone: "bg-sage text-ink",
		},
		{
			name: m.zelglihof_crops_pumpkin_name(),
			body: m.zelglihof_crops_pumpkin_body(),
			season: m.zelglihof_season_late_summer_autumn(),
			tone: "bg-sun text-ink",
		},
	];
}

function FieldBanner() {
	return (
		<figure className="relative mb-12 overflow-hidden rounded-[2rem] md:mb-16">
			<img
				src="/images/zuckermais-mulchfeld.jpg"
				alt={m.zelglihof_crops_field_alt()}
				loading="lazy"
				decoding="async"
				className="aspect-[4/3] w-full object-cover md:aspect-[16/7]"
			/>
			<figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent p-6 text-cream md:p-9">
				<p className="font-serif text-3xl font-bold md:text-4xl">
					{m.zelglihof_crops_field_name()}
				</p>
				<p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/80">
					{m.zelglihof_crops_field_body()}
				</p>
			</figcaption>
		</figure>
	);
}

function HarvestFeature() {
	return (
		<div className="my-16 grid gap-4 md:my-24 md:grid-cols-[0.8fr_1.2fr]">
			<figure className="relative min-h-[22rem] overflow-hidden rounded-[2rem] md:min-h-[32rem]">
				<img
					src="/images/broccoli-ernte-feld.jpg"
					alt={m.zelglihof_crops_harvest_field_alt()}
					loading="lazy"
					decoding="async"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<figcaption className="absolute bottom-5 left-5 right-5 w-fit rounded-2xl bg-ink/45 px-4 py-3 text-sm font-semibold text-cream backdrop-blur md:bottom-7 md:left-7 md:right-auto">
					{m.zelglihof_crops_harvest_field_caption()}
				</figcaption>
			</figure>
			<figure className="relative min-h-[22rem] overflow-hidden rounded-[2rem] md:min-h-[32rem]">
				<img
					src="/images/broccoli-ernte-team.jpg"
					alt={m.zelglihof_crops_harvest_team_alt()}
					loading="lazy"
					decoding="async"
					className="absolute inset-0 h-full w-full object-cover"
				/>
				<figcaption className="absolute bottom-5 left-5 right-5 w-fit rounded-2xl bg-ink/45 px-4 py-3 text-sm font-semibold text-cream backdrop-blur md:bottom-7 md:left-7 md:right-auto">
					{m.zelglihof_crops_harvest_team_caption()}
				</figcaption>
			</figure>
		</div>
	);
}

function CropGallery() {
	const images = [
		{
			src: "/images/broccoli-pflanzung.jpg",
			alt: m.zelglihof_crops_gallery_planting_alt(),
			caption: m.zelglihof_crops_gallery_planting(),
		},
		{
			src: "/images/zuckermais-beregnung-traktor.jpg",
			alt: m.zelglihof_crops_gallery_irrigation_alt(),
			caption: m.zelglihof_crops_gallery_irrigation(),
		},
		{
			src: "/images/spinat-beregnung.jpg",
			alt: m.zelglihof_crops_spinach_alt(),
			caption: m.zelglihof_crops_spinach_name(),
		},
		{
			src: "/images/broccoli-ernte-kiste.jpg",
			alt: m.zelglihof_crops_gallery_crate_alt(),
			caption: m.zelglihof_crops_gallery_crate(),
		},
	];

	return (
		<section className="shell">
			<p className="eyebrow text-clay">{m.zelglihof_crops_gallery_eyebrow()}</p>
			<div className="mt-5 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
				<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-5xl md:text-6xl">
					{m.zelglihof_crops_gallery_title()}
				</h2>
				<p className="max-w-xl text-lg leading-relaxed text-ink/65">
					{m.zelglihof_crops_gallery_body()}
				</p>
			</div>
			<div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
				{images.map((image) => (
					<figure key={image.src} className="group">
						<div className="overflow-hidden rounded-[1.5rem] bg-cream">
							<img
								src={image.src}
								alt={image.alt}
								loading="lazy"
								decoding="async"
								className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
							/>
						</div>
						<figcaption className="mt-3 text-sm font-semibold text-ink/70">
							{image.caption}
						</figcaption>
					</figure>
				))}
			</div>
		</section>
	);
}

export function CropMosaic() {
	return (
		<section className="shell pb-24 md:pb-32">
			<FieldBanner />
			<CropGroup
				title={m.zelglihof_crops_group_arable()}
				crops={arableCrops()}
			/>
			<HarvestFeature />
			<CropGroup
				title={m.zelglihof_crops_group_special()}
				crops={specialCrops()}
			/>
			<CropGallery />
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
	const wide = crop.wide ? "lg:col-span-2" : "";

	if (crop.image) {
		const mediaWide = crop.wide ? "tile-media--wide" : "";
		return (
			<article className={`tile-media ${mediaWide} ${wide}`}>
				<img
					src={crop.image}
					alt={crop.imageAlt ?? ""}
					loading="lazy"
					decoding="async"
				/>
				<div className="relative z-10 flex h-full flex-col justify-between gap-6">
					<p className="w-fit rounded-full bg-ink/35 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cream backdrop-blur">
						{crop.season}
					</p>
					<div>
						<h3 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-2xl text-cream">
							{crop.name}
						</h3>
						<p className="mt-2 max-w-md text-sm leading-relaxed text-cream/90">
							{crop.body}
						</p>
					</div>
				</div>
			</article>
		);
	}

	return (
		<article
			className={`flex flex-col justify-between rounded-[1.5rem] p-[1.35rem] ${wide} ${
				crop.wide
					? "aspect-[4/3] lg:aspect-[8/5]"
					: "aspect-[4/3] lg:aspect-[4/5]"
			} ${crop.tone ?? "bg-oat text-ink"}`}
		>
			<p className="w-fit rounded-full border border-current/25 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-current/80">
				{crop.season}
			</p>
			<div>
				<h3 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-2xl">
					{crop.name}
				</h3>
				<p className="mt-2 text-sm leading-relaxed opacity-90">{crop.body}</p>
			</div>
		</article>
	);
}
