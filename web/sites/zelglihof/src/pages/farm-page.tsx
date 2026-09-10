import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Beef, Bird, Leaf, Sprout, Wheat } from "lucide-react";

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

export function FarmPage() {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">
					{m.zelglihof_pages_farm_page_paragraph()}
				</p>
				<div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
					<h1 className="display-title text-6xl md:text-8xl">
						{m.zelglihof_pages_farm_page_heading()}
					</h1>
					<p className="max-w-xl text-xl leading-relaxed text-ink/60">
						{m.zelglihof_pages_farm_page_paragraph_2()}
					</p>
				</div>
			</section>
			<section className="shell grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
				<div className="relative min-h-[38rem] overflow-hidden rounded-[2rem]">
					<img
						src="/images/demo/demo-hof.jpg"
						alt={m.zelglihof_pages_farm_page_alt()}
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
					<p className="absolute bottom-8 left-8 max-w-lg font-serif text-4xl font-bold text-cream md:bottom-11 md:left-11 md:text-5xl">
						{m.zelglihof_pages_farm_page_paragraph_3()}
					</p>
				</div>
				<div className="grid gap-5">
					<Fact
						icon={<Beef />}
						value="F1"
						label={m.zelglihof_pages_farm_page_label()}
						color="bg-clay text-cream"
					/>
					<Fact
						icon={<Bird />}
						value="frisch"
						label={m.zelglihof_pages_farm_page_label_2()}
						color="bg-sun text-ink"
					/>
					<Fact
						icon={<Wheat />}
						value="ÖLN"
						label={m.zelglihof_pages_farm_page_label_3()}
						color="bg-sage text-ink"
					/>
				</div>
			</section>
			<section className="shell py-24 md:py-32">
				<div className="grid gap-14 lg:grid-cols-2 lg:items-center">
					<div>
						<p className="eyebrow text-moss">
							{m.zelglihof_pages_farm_page_paragraph_4()}
						</p>
						<h2 className="display-title mt-5 text-5xl md:text-6xl">
							{m.zelglihof_pages_farm_page_heading_2()}
						</h2>
						<p className="mt-7 text-lg leading-relaxed text-ink/65">
							{m.zelglihof_pages_farm_page_paragraph_5()}
						</p>
						<Link to="/products" className="button-primary mt-8">
							{m.zelglihof_pages_farm_page_text()}
							<ArrowRight size={17} />
						</Link>
					</div>
					<div className="rounded-[2rem] bg-forest p-8 text-cream md:p-12">
						<Beef size={58} strokeWidth={1.2} className="text-sun" />
						<p className="mt-14 font-serif text-4xl font-bold">
							{m.zelglihof_pages_farm_page_paragraph_6()}
						</p>
						<p className="mt-6 leading-relaxed text-cream/65">
							{m.zelglihof_pages_farm_page_paragraph_7()}
						</p>
					</div>
				</div>
			</section>
			<section className="bg-cream py-24 md:py-32">
				<div className="shell">
					<div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
						<div>
							<p className="eyebrow text-clay">
								{m.zelglihof_pages_farm_page_paragraph_8()}
							</p>
							<h2 className="display-title mt-5 text-5xl md:text-6xl">
								{m.zelglihof_pages_farm_page_heading_3()}
							</h2>
						</div>
						<div>
							<p className="text-xl leading-relaxed text-ink/60">
								{m.zelglihof_pages_farm_page_paragraph_9()}
							</p>
							<div className="mt-10 flex flex-wrap gap-3">
								{crops.map((crop, index) => (
									<span
										key={crop}
										className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${index % 3 === 0 ? "bg-sun/55" : index % 3 === 1 ? "bg-sage/45" : "bg-oat"}`}
									>
										{index % 2 === 0 ? (
											<Sprout size={15} />
										) : (
											<Leaf size={15} />
										)}
										{crop}
									</span>
								))}
							</div>
						</div>
					</div>
					<img
						src="/images/demo/demo-saat.jpg"
						alt={m.zelglihof_pages_farm_page_alt_2()}
						className="mt-14 aspect-[16/7] w-full rounded-[2rem] object-cover"
					/>
				</div>
			</section>
			<section className="shell py-24">
				<div className="rounded-[2rem] bg-sun p-8 md:flex md:items-center md:justify-between md:p-12">
					<div>
						<p className="eyebrow">
							{m.zelglihof_pages_farm_page_paragraph_10()}
						</p>
						<h2 className="mt-5 font-serif text-4xl font-bold">
							{m.zelglihof_pages_farm_page_heading_4()}
						</h2>
					</div>
					<Link to="/contact" className="button-primary mt-8 md:mt-0">
						{m.zelglihof_pages_farm_page_text_2()}
						<ArrowRight size={17} />
					</Link>
				</div>
			</section>
		</>
	);
}

function Fact({
	icon,
	value,
	label,
	color,
}: {
	icon: React.ReactNode;
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
