import { m } from "@oliumbi/i18n/messages";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { farmMapLink } from "../model/location";
import { ContactForm } from "./contact-form";

export function ContactDetails() {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">{m.contact()}</p>
				<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
					<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-6xl md:text-8xl">
						{m.zelglihof_contact_hero_title()}
						<br />
						{m.zelglihof_contact_hero_title_accent()}
					</h1>
					<p className="max-w-lg text-xl leading-relaxed text-ink/60">
						{m.zelglihof_contact_hero_description()}
					</p>
				</div>
			</section>
			<section className="shell grid gap-6 pb-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
				<div className="grid gap-5">
					<div className="rounded-[2rem] bg-forest p-7 text-cream md:p-9">
						<MapPin className="text-sun" size={30} />
						<h2 className="mt-8 font-serif text-3xl font-bold">
							{m.zelglihof_street()}
							<br />
							{m.zelglihof_postal_address()}
						</h2>
						<a
							href={farmMapLink}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-transparent bg-cream px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-ink transition hover:-translate-y-0.5 hover:bg-sun mt-7"
						>
							{m.zelglihof_contact_directions()}
							<ArrowUpRight size={17} />
						</a>
					</div>
					<div className="rounded-[2rem] bg-sage/55 p-7 md:p-9">
						<Clock3 size={28} />
						<h2 className="mt-7 font-serif text-3xl font-bold">
							{m.zelglihof_shop()}
						</h2>
						<p className="mt-3 leading-relaxed text-ink/60">
							{m.zelglihof_contact_shop_body()}
						</p>
					</div>
					<p className="px-2 text-sm leading-relaxed text-ink/50">
						{m.zelglihof_contact_inquiry_body()}
					</p>
				</div>
				<ContactForm />
			</section>
		</>
	);
}
