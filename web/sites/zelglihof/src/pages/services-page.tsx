import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

const services = [
	{
		name: "Saat",
		text: m.zelglihof_pages_services_page_text(),
		image: "/images/demo/demo-saat.jpg",
	},
	{
		name: "Pflanzenschutz",
		text: m.zelglihof_pages_services_page_text_2(),
		image: "/images/demo/demo-pflanzenschutz.jpg",
	},
	{
		name: "Winterdienst",
		text: m.zelglihof_pages_services_page_text_3(),
		image: "/images/demo/demo-winterdienst.jpg",
	},
];

export function ServicesPage() {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">
					{m.zelglihof_pages_services_page_paragraph()}
				</p>
				<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
					<h1 className="display-title text-6xl md:text-8xl">
						{m.zelglihof_pages_services_page_heading()}
					</h1>
					<p className="max-w-xl text-xl leading-relaxed text-ink/60">
						{m.zelglihof_pages_services_page_paragraph_2()}
					</p>
				</div>
			</section>
			<section className="shell grid gap-6 pb-24">
				{services.map((service, index) => (
					<article
						key={service.name}
						className="grid overflow-hidden rounded-[2rem] bg-cream md:grid-cols-2"
					>
						<img
							src={service.image}
							alt=""
							className={`min-h-72 h-full w-full object-cover ${index % 2 ? "md:order-2" : ""}`}
						/>
						<div className="flex flex-col justify-between p-7 md:p-10">
							<div>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-clay">
									0{index + 1}
								</p>
								<h2 className="mt-4 font-serif text-5xl font-bold">
									{service.name}
								</h2>
								<p className="mt-5 max-w-lg text-lg leading-relaxed text-ink/60">
									{service.text}
								</p>
							</div>
							<Link
								to="/contact"
								className="mt-10 inline-flex items-center gap-2 font-bold"
							>
								{m.zelglihof_pages_services_page_text_4()}
								<ArrowRight size={18} />
							</Link>
						</div>
					</article>
				))}
			</section>
		</>
	);
}
