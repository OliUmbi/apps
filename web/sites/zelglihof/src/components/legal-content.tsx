import { m } from "@oliumbi/i18n/messages";
import type { ReactNode } from "react";

function LegalPage({
	eyebrow,
	title,
	children,
}: {
	eyebrow: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<article className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] max-w-4xl py-14 md:py-24">
			<p className="inline-flex items-center gap-[0.55rem] text-[0.72rem] font-bold uppercase leading-none tracking-[0.16em] before:h-px before:w-[1.8rem] before:bg-current before:content-[''] text-clay">
				{eyebrow}
			</p>
			<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] mt-5 text-6xl md:text-7xl">
				{title}
			</h1>
			<div className="mt-14 space-y-10 rounded-[2rem] bg-cream p-7 leading-relaxed text-ink/68 md:p-12 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-ink [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
				{children}
			</div>
		</article>
	);
}

export function ImprintPage() {
	return (
		<LegalPage eyebrow={m.legal()} title={m.imprint()}>
			<section>
				<h2>{m.responsible_party()}</h2>
				<p>
					{m.zelglihof_company_name()}
					<br />
					{m.zelglihof_street()}
					<br />
					{m.zelglihof_postal_address()}
					<br />
					{m.switzerland()}
				</p>
			</section>
			<section>
				<h2>{m.contact()}</h2>
				<p>{m.zelglihof_legal_contact_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_legal_liability_title()}</h2>
				<p>{m.zelglihof_legal_liability_body()}</p>
			</section>
			<section>
				<h2>{m.copyright_title()}</h2>
				<p>{m.zelglihof_legal_copyright_body()}</p>
			</section>
		</LegalPage>
	);
}

export function PrivacyPage() {
	return (
		<LegalPage eyebrow={m.legal()} title={m.privacy()}>
			<section>
				<h2>{m.zelglihof_privacy_scope_title()}</h2>
				<p>{m.zelglihof_privacy_scope_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_privacy_newsletter_title()}</h2>
				<p>{m.zelglihof_privacy_newsletter_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_privacy_inquiries_title()}</h2>
				<p>{m.zelglihof_privacy_inquiries_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_privacy_technical_data_title()}</h2>
				<p>{m.zelglihof_privacy_technical_data_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_privacy_rights_title()}</h2>
				<p>{m.zelglihof_privacy_rights_body()}</p>
			</section>
		</LegalPage>
	);
}

export function TermsPage() {
	return (
		<LegalPage eyebrow={m.legal()} title={m.zelglihof_terms_title()}>
			<section>
				<h2>{m.zelglihof_terms_reservation_title()}</h2>
				<p>{m.zelglihof_terms_reservation_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_terms_availability_title()}</h2>
				<p>{m.zelglihof_terms_availability_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_terms_pickup_title()}</h2>
				<p>{m.zelglihof_terms_pickup_body()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_terms_cancellation_title()}</h2>
				<p>{m.zelglihof_terms_cancellation_body()}</p>
			</section>
		</LegalPage>
	);
}
