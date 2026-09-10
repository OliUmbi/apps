import { m } from "@oliumbi/i18n/messages";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { ContactForm } from "../components/contact-form";

export function ContactPage() {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">
					{m.zelglihof_pages_contact_page_paragraph()}
				</p>
				<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
					<h1 className="display-title text-6xl md:text-8xl">
						{m.zelglihof_pages_contact_page_heading()}
						<br />
						{m.zelglihof_pages_contact_page_heading_2()}
					</h1>
					<p className="max-w-lg text-xl leading-relaxed text-ink/60">
						{m.zelglihof_pages_contact_page_paragraph_2()}
					</p>
				</div>
			</section>
			<section className="shell grid gap-6 pb-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
				<div className="grid gap-5">
					<div className="rounded-[2rem] bg-forest p-7 text-cream md:p-9">
						<MapPin className="text-sun" size={30} />
						<h2 className="mt-8 font-serif text-3xl font-bold">
							{m.zelglihof_pages_contact_page_heading_3()}
							<br />
							{m.zelglihof_pages_contact_page_heading_4()}
						</h2>
						<a
							href="https://www.openstreetmap.org/search?query=Zelgliweg%202%2C%205506%20M%C3%A4genwil"
							target="_blank"
							rel="noreferrer"
							className="button-light mt-7"
						>
							{m.zelglihof_pages_contact_page_text()}
							<ArrowUpRight size={17} />
						</a>
					</div>
					<div className="rounded-[2rem] bg-sage/55 p-7 md:p-9">
						<Clock3 size={28} />
						<h2 className="mt-7 font-serif text-3xl font-bold">
							{m.zelglihof_pages_contact_page_heading_5()}
						</h2>
						<p className="mt-3 leading-relaxed text-ink/60">
							{m.zelglihof_pages_contact_page_paragraph_3()}
						</p>
					</div>
					<p className="px-2 text-sm leading-relaxed text-ink/50">
						{m.zelglihof_pages_contact_page_paragraph_4()}
					</p>
				</div>
				<ContactForm />
			</section>
		</>
	);
}
