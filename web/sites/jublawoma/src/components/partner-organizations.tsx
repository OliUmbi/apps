import { m } from "@oliumbi/i18n/messages";
import { ExternalLink } from "lucide-react";

// Messages resolve per render; module scope would bake one locale in (U-20).
function partners() {
	return [
		{
			name: "Jubla Schweiz",
			href: "https://www.jubla.ch/",
			image: "/assets/images/logos/jubla.jpg",
			description: m.jublawoma_about_partner_jubla_schweiz_body,
		},
		{
			name: "Jubla Aargau",
			href: "https://www.jublaaargau.ch/",
			image: "/assets/images/logos/aargau.svg",
			description: m.jublawoma_about_partner_jubla_aargau_body,
		},
		{
			name: "Jugend + Sport",
			href: "https://www.jugendundsport.ch/de",
			image: "/assets/images/logos/js.jpg",
			description: m.jublawoma_about_partner_jugend_sport_body,
		},
		{
			name: "Gemeinde Mägenwil",
			href: "https://www.maegenwil.ch/",
			image: "/assets/images/logos/maegenwil.png",
			description: null,
		},
		{
			name: "Gemeinde Wohlenschwil",
			href: "https://www.wohlenschwil.ch/",
			image: "/assets/images/logos/wohlenschwil.webp",
			description: null,
		},
	];
}

export function PartnerOrganizations() {
	return (
		<section className="bg-moss text-oat py-20">
			<div className="shell">
				<p className="kicker light">{m.jublawoma_about_partners_title()}</p>
				<div className="partner-grid mt-8 grid gap-px overflow-hidden rounded-3xl bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
					{partners().map((partner) => (
						<a
							className="group flex min-h-52 flex-col justify-between bg-moss p-6"
							href={partner.href}
							target="_blank"
							rel="noopener noreferrer"
							key={partner.name}
						>
							<div>
								<img
									className="h-20 w-full rounded-xl bg-white object-contain p-3"
									src={partner.image}
									alt=""
								/>
								{partner.description ? (
									<p className="mt-4 text-sm leading-relaxed text-oat">
										{partner.description()}
									</p>
								) : null}
							</div>
							<strong className="mt-7 flex items-center justify-between gap-3">
								{partner.name}
								<ExternalLink
									className="transition group-hover:translate-x-1"
									size={18}
									aria-hidden="true"
								/>
							</strong>
						</a>
					))}
				</div>
			</div>
		</section>
	);
}
