import { m } from "@oliumbi/i18n/messages";
import type { ReactNode } from "react";

export function LegalPage({
	title,
	children,
}: Readonly<{ title: string; children: ReactNode }>) {
	return (
		<section className="measure min-h-[70vh] pt-40 pb-24">
			<p className="eyebrow text-brass">
				{m.unclet_components_legal_page_paragraph()}
			</p>
			<h1 className="display-title mt-5 text-6xl md:text-8xl">{title}</h1>
			<div className="mt-14 space-y-9 text-sm leading-relaxed text-bone/60 [&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-bone [&_p]:max-w-3xl">
				{children}
			</div>
		</section>
	);
}
