import { m } from "@oliumbi/i18n/messages";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ImageName } from "../../model/images";
import { StaticImage } from "../static-image";

type CropImage = {
	name: ImageName;
	alt: string;
};

type Crop = {
	name: string;
	body: string;
	season: string;
	images?: CropImage[];
	tone?: string;
};

// Messages resolve at render time, never at module scope.
function arableCrops(): Crop[] {
	return [
		{
			name: m.zelglihof_crops_corn_name(),
			body: m.zelglihof_crops_corn_body(),
			season: m.zelglihof_season_summer_autumn(),
			images: [
				{
					name: "futtermais",
					alt: m.zelglihof_crops_corn_alt(),
				},
			],
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
			images: [
				{
					name: "weizen",
					alt: m.zelglihof_crops_wheat_alt(),
				},
			],
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
			images: [
				{
					name: "zuckerrueben",
					alt: m.zelglihof_crops_beets_alt(),
				},
			],
		},
	];
}

function specialCrops(): Crop[] {
	return [
		{
			name: m.zelglihof_crops_maize_name(),
			body: m.zelglihof_crops_maize_body(),
			season: m.zelglihof_season_summer(),
			images: [
				{
					name: "zuckermais-mulchfolie",
					alt: m.zelglihof_crops_maize_alt(),
				},
			],
		},
		{
			name: m.zelglihof_crops_spinach_name(),
			body: m.zelglihof_crops_spinach_body(),
			season: m.zelglihof_season_spring_autumn(),
			images: [
				{
					name: "spinat-feld",
					alt: m.zelglihof_crops_spinach_alt(),
				},
			],
		},
		{
			name: m.zelglihof_crops_broccoli_name(),
			body: m.zelglihof_crops_broccoli_body(),
			season: m.zelglihof_season_summer_autumn(),
			images: [
				{
					name: "broccoli-verarbeitung",
					alt: m.zelglihof_crops_broccoli_alt(),
				},
			],
		},
		{
			name: m.zelglihof_crops_beans_name(),
			body: m.zelglihof_crops_beans_body(),
			season: m.zelglihof_season_summer(),
			images: [
				{
					name: "bohnen",
					alt: m.zelglihof_crops_beans_alt(),
				},
			],
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
			images: [
				{
					name: "kuerbisse",
					alt: m.zelglihof_crops_pumpkin_alt(),
				},
				{
					name: "kuerbisse-2",
					alt: m.zelglihof_crops_pumpkin_alt_2(),
				},
				{
					name: "kuerbisse-3",
					alt: m.zelglihof_crops_pumpkin_alt_3(),
				},
			],
		},
	];
}

function FieldBanner() {
	return (
		<figure className="relative mt-12 mb-12 overflow-hidden rounded-[2rem] md:mt-16 md:mb-16">
			<StaticImage
				name="zuckermais-mulchfeld"
				alt={m.zelglihof_crops_field_alt()}
				sizes="100vw"
				priority
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

function CropProcess() {
	const steps = [
		{
			name: "broccoli-pflanzung" as const,
			alt: m.zelglihof_crops_gallery_planting_alt(),
			caption: m.zelglihof_crops_gallery_planting(),
		},
		{
			name: "broccoli-bewaesserung" as const,
			alt: m.zelglihof_crops_gallery_irrigation_alt(),
			caption: m.zelglihof_crops_gallery_irrigation(),
		},
		{
			name: "broccoli-ernte-team" as const,
			alt: m.zelglihof_crops_gallery_harvest_alt(),
			caption: m.zelglihof_crops_gallery_harvest(),
		},
		{
			name: "broccoli-ernte-kiste" as const,
			alt: m.zelglihof_crops_gallery_crate_alt(),
			caption: m.zelglihof_crops_gallery_crate(),
		},
	];

	return (
		<section className="my-16 md:my-24">
			<p className="eyebrow text-clay">{m.zelglihof_crops_gallery_eyebrow()}</p>
			<div className="mt-5 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
				<h2 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-4xl md:text-5xl">
					{m.zelglihof_crops_gallery_title()}
				</h2>
				<p className="max-w-xl text-lg leading-relaxed text-ink/65">
					{m.zelglihof_crops_gallery_body()}
				</p>
			</div>
			<div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
				{steps.map((step) => (
					<figure key={step.name}>
						<div className="relative overflow-hidden rounded-[1.5rem] bg-cream">
							<StaticImage
								name={step.name}
								alt={step.alt}
								sizes="(min-width: 1024px) 25vw, 50vw"
								className="aspect-[4/5] w-full object-cover"
							/>
						</div>
						<figcaption className="mt-3 text-sm font-semibold text-ink/70">
							{step.caption}
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
			<CropProcess />
			<CropGroup
				title={m.zelglihof_crops_group_special()}
				crops={specialCrops()}
			/>
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
	const images = crop.images ?? [];
	const [index, setIndex] = useState(0);

	if (images.length > 0) {
		const previous = () =>
			setIndex((current) => (current - 1 + images.length) % images.length);
		const next = () => setIndex((current) => (current + 1) % images.length);

		return (
			<article className="relative flex aspect-[4/5] flex-col justify-between gap-6 overflow-hidden rounded-[1.5rem] p-[1.35rem]">
				{images.map((image, imageIndex) => (
					<div
						key={image.name}
						className={`absolute inset-0 transition-opacity duration-500 ${
							imageIndex === index ? "opacity-100" : "opacity-0"
						}`}
					>
						<StaticImage
							name={image.name}
							alt={imageIndex === index ? image.alt : ""}
							sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
							className="absolute inset-0 h-full w-full object-cover"
						/>
					</div>
				))}
				<div
					className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent"
					aria-hidden="true"
				/>
				<div className="relative z-10 flex items-start justify-between gap-3">
					<p className="w-fit rounded-full bg-ink/35 px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-cream backdrop-blur">
						{crop.season}
					</p>
					{images.length > 1 && (
						<span
							aria-live="polite"
							className="rounded-full bg-ink/35 px-2.5 py-1 text-[0.62rem] font-bold text-cream backdrop-blur"
						>
							{index + 1}/{images.length}
						</span>
					)}
				</div>
				<div className="relative z-10">
					<h3 className="font-serif font-bold leading-[1.04] tracking-[-0.035em] text-2xl text-cream">
						{crop.name}
					</h3>
					<p className="mt-2 max-w-md text-sm leading-relaxed text-cream/90">
						{crop.body}
					</p>
					{images.length > 1 && (
						<div className="mt-4 flex gap-2">
							<button
								type="button"
								onClick={previous}
								aria-label={m.zelglihof_crops_gallery_previous()}
								className="grid size-9 place-items-center rounded-full bg-cream/90 text-ink transition hover:bg-cream"
							>
								<ChevronLeft size={18} aria-hidden="true" />
							</button>
							<button
								type="button"
								onClick={next}
								aria-label={m.zelglihof_crops_gallery_next()}
								className="grid size-9 place-items-center rounded-full bg-cream/90 text-ink transition hover:bg-cream"
							>
								<ChevronRight size={18} aria-hidden="true" />
							</button>
						</div>
					)}
				</div>
			</article>
		);
	}

	return (
		<article
			className={`flex aspect-[4/3] flex-col justify-between rounded-[1.5rem] p-[1.35rem] lg:aspect-[4/5] ${
				crop.tone ?? "bg-oat text-ink"
			}`}
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
