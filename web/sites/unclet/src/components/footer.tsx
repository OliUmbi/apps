import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t border-bone/10 bg-night py-14">
			<div className="shell grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
				<div>
					<p className="font-serif text-4xl">{m.unclet_brand()}</p>
					<p className="mt-4 max-w-sm text-sm leading-relaxed text-bone/55">
						{m.unclet_footer_description()}
					</p>
				</div>
				<div className="text-sm leading-7 text-bone/60">
					<p className="eyebrow mb-3 text-brass">{m.contact()}</p>
					<p>{m.unclet_footer_company_contact()}</p>
					<p>{m.unclet_footer_address()}</p>
					<a
						href="mailto:info@uncle-t.ch"
						className="mt-2 inline-block text-bone hover:text-brass-light"
					>
						{m.unclet_email()}
					</a>
				</div>
				<div className="flex flex-col items-start gap-3 text-sm text-bone/60">
					<p className="eyebrow mb-1 text-brass">{m.unclet_footer_more()}</p>
					<a
						href="https://www.instagram.com/unclet_gmbh/"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2 hover:text-brass-light"
					>
						{m.unclet_footer_instagram()}
						<ArrowUpRight size={14} />
					</a>
					<Link to="/legal" className="hover:text-brass-light">
						{m.imprint()}
					</Link>
					<Link to="/privacy" className="hover:text-brass-light">
						{m.privacy()}
					</Link>
					<Link to="/terms" className="hover:text-brass-light">
						{m.terms()}
					</Link>
				</div>
			</div>
		</footer>
	);
}
