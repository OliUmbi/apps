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
		<article className="shell max-w-4xl py-14 md:py-24">
			<p className="eyebrow text-clay">{eyebrow}</p>
			<h1 className="display-title mt-5 text-6xl md:text-7xl">{title}</h1>
			<div className="mt-14 space-y-10 rounded-[2rem] bg-cream p-7 leading-relaxed text-ink/68 md:p-12 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-ink [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
				{children}
			</div>
		</article>
	);
}

export function ImprintPage() {
	return (
		<LegalPage
			eyebrow={m.zelglihof_pages_legal_pages_eyebrow()}
			title={m.zelglihof_pages_legal_pages_title()}
		>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading()}</h2>
				<p>
					{m.zelglihof_pages_legal_pages_paragraph()}
					<br />
					{m.zelglihof_pages_legal_pages_paragraph_2()}
					<br />
					{m.zelglihof_pages_legal_pages_paragraph_3()}
					<br />
					{m.zelglihof_pages_legal_pages_paragraph_4()}
				</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_2()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_5()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_3()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_6()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_4()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_7()}</p>
			</section>
		</LegalPage>
	);
}

export function PrivacyPage() {
	return (
		<LegalPage
			eyebrow={m.zelglihof_pages_legal_pages_eyebrow_2()}
			title={m.zelglihof_pages_legal_pages_title_2()}
		>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_5()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_8()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_6()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_9()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_7()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_10()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_8()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_11()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_9()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_12()}</p>
			</section>
		</LegalPage>
	);
}

export function TermsPage() {
	return (
		<LegalPage
			eyebrow={m.zelglihof_pages_legal_pages_eyebrow_3()}
			title={m.zelglihof_pages_legal_pages_title_3()}
		>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_10()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_13()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_11()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_14()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_12()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_15()}</p>
			</section>
			<section>
				<h2>{m.zelglihof_pages_legal_pages_heading_13()}</h2>
				<p>{m.zelglihof_pages_legal_pages_paragraph_16()}</p>
			</section>
		</LegalPage>
	);
}
