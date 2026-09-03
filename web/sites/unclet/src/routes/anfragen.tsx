import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { InquiryForm } from "../components/inquiry-form";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/anfragen")({
	head: () => ({
		meta: [
			{ title: "Anlass anfragen · Uncle-T" },
			{
				name: "description",
				content:
					"Fragen Sie Ihr individuelles Catering oder Private Dinner bei Uncle-T an.",
			},
		],
	}),
	component: InquiryPage,
});

function InquiryPage() {
	return (
		<>
			<PageHero
				eyebrow="Unverbindliche Anfrage"
				title={
					<>
						Was dürfen wir
						<br />
						<span className="text-brass-light italic">für Sie kochen?</span>
					</>
				}
				intro="Ein paar Eckpunkte reichen für den Anfang. Thomas meldet sich persönlich, um Wünsche, Möglichkeiten und den passenden Rahmen zu besprechen."
			/>
			<section className="shell grid gap-16 py-20 md:py-28 lg:grid-cols-[.65fr_1.35fr]">
				<aside>
					<p className="eyebrow text-brass">Direkter Kontakt</p>
					<div className="mt-8 space-y-6 text-bone/60">
						<a
							href="mailto:info@uncle-t.ch"
							className="flex items-center gap-3 hover:text-brass-light"
						>
							<Mail size={18} className="text-brass" /> info@uncle-t.ch
						</a>
						<div className="flex items-start gap-3">
							<MapPin size={18} className="mt-1 shrink-0 text-brass" />
							<p>
								Uncle-T GmbH
								<br />
								Zelgliweg 2<br />
								5506 Mägenwil
							</p>
						</div>
					</div>
					<div className="rule mt-10" />
					<p className="mt-6 text-sm leading-relaxed text-bone/45">
						Einsatzgebiet: Aargau und Umgebung, unter anderem Mägenwil, Lupfig,
						Mellingen, Baden, Brugg, Wohlen und Aarau. Weitere Orte nach
						Absprache.
					</p>
				</aside>
				<InquiryForm />
			</section>
		</>
	);
}
