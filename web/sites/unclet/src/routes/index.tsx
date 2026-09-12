import { m } from "@oliumbi/i18n/messages";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowRight, Award, MapPin, Users } from "lucide-react";
import { PublicReviews } from "../components/public-reviews";

export const Route = createFileRoute("/")({ component: HomePage });

const formats = [
	{
		number: "01",
		title: m.unclet_routes_index_title(),
		copy: m.unclet_routes_index_copy(),
	},
	{
		number: "02",
		title: m.unclet_routes_index_title_2(),
		copy: m.unclet_routes_index_copy_2(),
	},
	{
		number: "03",
		title: m.unclet_routes_index_title_3(),
		copy: m.unclet_routes_index_copy_3(),
	},
];

function HomePage() {
	return (
		<>
			<section className="relative min-h-[92svh] overflow-hidden pt-20">
				<img
					src="/images/private-dinner.jpg"
					alt={m.unclet_routes_index_alt()}
					className="absolute inset-0 size-full object-cover object-center"
				/>
				<div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,17,15,.96)_0%,rgba(17,17,15,.72)_47%,rgba(17,17,15,.18)_100%)]" />
				<div className="shell relative z-10 flex min-h-[calc(92svh-5rem)] items-end pb-14 md:items-center md:pb-0">
					<div className="max-w-4xl">
						<p className="eyebrow text-brass-light">
							{m.unclet_routes_index_paragraph()}
						</p>
						<h1 className="display-title mt-6 text-[clamp(4.1rem,10vw,9.5rem)]">
							{m.unclet_routes_index_heading()}
							<br />
							<span className="text-brass-light italic">
								{m.unclet_routes_index_text()}
							</span>
						</h1>
						<p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/70 md:text-xl">
							{m.unclet_routes_index_paragraph_2()}
						</p>
						<div className="mt-10 flex flex-wrap gap-3">
							<Link to="/inquiry" className="button-primary">
								{m.unclet_routes_index_text_2()}
								<ArrowRight size={17} />
							</Link>
							<Link to="/services" className="button-secondary">
								{m.unclet_routes_index_text_3()}
							</Link>
						</div>
					</div>
				</div>
				<a
					href="#angebot"
					className="absolute right-5 bottom-8 z-10 hidden items-center gap-3 text-xs tracking-widest text-bone/55 uppercase md:flex"
				>
					{m.unclet_routes_index_text_4()}
					<ArrowDown size={16} />
				</a>
			</section>

			<section id="angebot" className="bg-paper py-24 text-night md:py-36">
				<div className="shell">
					<div className="grid gap-12 md:grid-cols-[.8fr_1.2fr] md:items-end">
						<p className="eyebrow text-brass">
							{m.unclet_routes_index_paragraph_3()}
						</p>
						<h2 className="display-title text-5xl md:text-7xl">
							{m.unclet_routes_index_heading_2()}
							<br />
							{m.unclet_routes_index_heading_3()}
						</h2>
					</div>
					<div className="mt-16 grid border-t border-night/15 md:grid-cols-3">
						{formats.map((format) => (
							<article
								key={format.number}
								className="border-b border-night/15 py-8 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0"
							>
								<span className="font-mono text-xs text-brass">
									{format.number}
								</span>
								<h3 className="mt-10 font-serif text-3xl">{format.title}</h3>
								<p className="mt-4 leading-relaxed text-night/60">
									{format.copy}
								</p>
							</article>
						))}
					</div>
					<Link
						to="/services"
						className="mt-10 inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase hover:text-brass"
					>
						{m.unclet_routes_index_text_5()}
						<ArrowRight size={16} />
					</Link>
				</div>
			</section>

			<section className="grid lg:grid-cols-2">
				<div className="image-treatment min-h-[520px]">
					<img
						src="/images/thomas.jpg"
						alt={m.unclet_routes_index_alt_2()}
						className="object-top"
					/>
				</div>
				<div className="flex items-center bg-coal px-6 py-20 md:px-16 lg:px-20">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_routes_index_paragraph_4()}
						</p>
						<h2 className="display-title mt-7 text-5xl md:text-7xl">
							{m.unclet_routes_index_heading_4()}
						</h2>
						<p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/60">
							{m.unclet_routes_index_paragraph_5()}
						</p>
						<div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-bone/65">
							<span className="flex items-center gap-2">
								<Award size={17} className="text-brass" />
								{m.unclet_routes_index_text_6()}
							</span>
							<span className="flex items-center gap-2">
								<MapPin size={17} className="text-brass" />
								{m.unclet_routes_index_text_7()}
							</span>
							<span className="flex items-center gap-2">
								<Users size={17} className="text-brass" />
								{m.unclet_routes_index_text_8()}
							</span>
						</div>
						<Link to="/about" className="button-secondary mt-10">
							{m.unclet_routes_index_text_9()}
						</Link>
					</div>
				</div>
			</section>

			<section className="shell py-24 md:py-36">
				<div className="grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end">
					<div>
						<p className="eyebrow text-brass">
							{m.unclet_routes_index_paragraph_6()}
						</p>
						<h2 className="display-title mt-6 text-5xl md:text-7xl">
							{m.unclet_routes_index_heading_5()}
						</h2>
					</div>
					<p className="max-w-md leading-relaxed text-bone/55 md:justify-self-end">
						{m.unclet_routes_index_paragraph_7()}
					</p>
				</div>
				<div className="mt-14 grid auto-rows-[280px] gap-3 md:grid-cols-12">
					<div className="image-treatment md:col-span-7 md:row-span-2">
						<img
							src="/images/event-table.jpg"
							alt={m.unclet_routes_index_alt_3()}
						/>
					</div>
					<div className="image-treatment md:col-span-5">
						<img
							src="/images/plating.jpg"
							alt={m.unclet_routes_index_alt_4()}
						/>
					</div>
					<div className="image-treatment md:col-span-5">
						<img src="/images/fire.jpg" alt={m.unclet_routes_index_alt_5()} />
					</div>
				</div>
				<Link to="/showcases" className="button-secondary mt-10">
					{m.unclet_routes_index_text_10()}
					<ArrowRight size={16} />
				</Link>
			</section>

			<PublicReviews />
			<section className="border-y border-brass/25 bg-brass py-20 text-night md:py-28">
				<div className="shell grid gap-10 md:grid-cols-[1.3fr_.7fr] md:items-end">
					<div>
						<p className="eyebrow">{m.unclet_routes_index_paragraph_8()}</p>
						<h2 className="display-title mt-5 text-5xl md:text-7xl">
							{m.unclet_routes_index_heading_6()}
						</h2>
					</div>
					<div>
						<p className="leading-relaxed text-night/65">
							{m.unclet_routes_index_paragraph_9()}
						</p>
						<Link to="/inquiry" className="button-dark mt-7">
							{m.unclet_routes_index_text_11()}
							<ArrowRight size={16} />
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}
