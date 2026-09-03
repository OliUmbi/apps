import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import { ContactForm } from "../components/contact-form";

export function ContactPage() {
	return (
		<>
			<section className="shell py-14 md:py-24">
				<p className="eyebrow text-clay">Kontakt</p>
				<div className="mt-5 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-end">
					<h1 className="display-title text-6xl md:text-8xl">
						Kurz fragen.
						<br />
						Direkt klären.
					</h1>
					<p className="max-w-lg text-xl leading-relaxed text-ink/60">
						Bei uns landet deine Nachricht nicht in einem Ticketsystem, sondern
						direkt beim Hof.
					</p>
				</div>
			</section>
			<section className="shell grid gap-6 pb-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
				<div className="grid gap-5">
					<div className="rounded-[2rem] bg-forest p-7 text-cream md:p-9">
						<MapPin className="text-sun" size={30} />
						<h2 className="mt-8 font-serif text-3xl font-bold">
							Zelgliweg 2<br />
							5506 Mägenwil
						</h2>
						<a
							href="https://www.openstreetmap.org/search?query=Zelgliweg%202%2C%205506%20M%C3%A4genwil"
							target="_blank"
							rel="noreferrer"
							className="button-light mt-7"
						>
							Route öffnen <ArrowUpRight size={17} />
						</a>
					</div>
					<div className="rounded-[2rem] bg-sage/55 p-7 md:p-9">
						<Clock3 size={28} />
						<h2 className="mt-7 font-serif text-3xl font-bold">Hofladen</h2>
						<p className="mt-3 leading-relaxed text-ink/60">
							Frische Eier und saisonale Produkte stehen zur Selbstbedienung
							bereit. Abholtermine für Reservationen bestätigen wir persönlich.
						</p>
					</div>
					<p className="px-2 text-sm leading-relaxed text-ink/50">
						Für Produktanfragen und Reservationen ist das Formular der
						schnellste Weg. Bei einer Abholung erhältst du alle Details mit der
						Bestätigung.
					</p>
				</div>
				<ContactForm />
			</section>
		</>
	);
}
