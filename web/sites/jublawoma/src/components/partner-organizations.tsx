import { m } from "@oliumbi/i18n/messages";
import { ExternalLink } from "lucide-react";

const partners = [
	{
		name: "Jubla Schweiz",
		href: "https://www.jubla.ch/",
		image: "/assets/images/logos/jubla.jpg",
	},
	{
		name: "Jubla Aargau",
		href: "https://www.jublaaargau.ch/",
		image: "/assets/images/logos/aargau.svg",
	},
	{
		name: "Jugend + Sport",
		href: "https://www.jugendundsport.ch/de",
		image: "/assets/images/logos/js.jpg",
	},
	{
		name: "Gemeinde Mägenwil",
		href: "https://www.maegenwil.ch/",
		image: "/assets/images/logos/maegenwil.png",
	},
	{
		name: "Gemeinde Wohlenschwil",
		href: "https://www.wohlenschwil.ch/",
		image: "/assets/images/logos/wohlenschwil.webp",
	},
] as const;

export function PartnerOrganizations() {
	return (
		<section className="network">
			<div className="shell">
				<p className="kicker light">{m.jublawoma_routes_about_paragraph_5()}</p>
				<div className="mt-8 grid gap-px overflow-hidden rounded-3xl bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
					{partners.map((partner) => (
						<a
							className="group flex min-h-52 flex-col justify-between bg-moss p-6"
							href={partner.href}
							target="_blank"
							rel="noreferrer"
							key={partner.name}
						>
							<img
								className="h-20 w-full rounded-xl bg-white object-contain p-3"
								src={partner.image}
								alt=""
							/>
							<strong className="mt-7 flex items-center justify-between gap-3">
								{partner.name}
								<ExternalLink
									className="transition group-hover:translate-x-1"
									size={18}
								/>
							</strong>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
