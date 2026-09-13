import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t border-bone/10 bg-night py-14">
			<div className="shell grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
				<div>
					<p className="font-serif text-4xl">
						{m.unclet_components_footer_footer_paragraph()}
					</p>
					<p className="mt-4 max-w-sm text-sm leading-relaxed text-bone/55">
						{m.unclet_components_footer_footer_paragraph_2()}
					</p>
				</div>
				<div className="text-sm leading-7 text-bone/60">
					<p className="eyebrow mb-3 text-brass">
						{m.unclet_components_footer_footer_paragraph_3()}
					</p>
					<p>{m.unclet_components_footer_footer_paragraph_4()}</p>
					<p>{m.unclet_components_footer_footer_paragraph_5()}</p>
					<a
						href="mailto:info@uncle-t.ch"
						className="mt-2 inline-block text-bone hover:text-brass-light"
					>
						{m.unclet_components_footer_footer_text()}
					</a>
				</div>
				<div className="flex flex-col items-start gap-3 text-sm text-bone/60">
					<p className="eyebrow mb-1 text-brass">
						{m.unclet_components_footer_footer_paragraph_6()}
					</p>
					<a
						href="https://www.instagram.com/unclet_gmbh/"
						target="_blank"
						rel="noreferrer"
						className="flex items-center gap-2 hover:text-brass-light"
					>
						{m.unclet_components_footer_footer_text_2()}
						<ArrowUpRight size={14} />
					</a>
					<Link to="/legal" className="hover:text-brass-light">
						{m.unclet_components_footer_footer_text_3()}
					</Link>
					<Link to="/privacy" className="hover:text-brass-light">
						{m.unclet_components_footer_footer_text_4()}
					</Link>
					<Link to="/terms" className="hover:text-brass-light">
						{m.unclet_components_footer_footer_text_5()}
					</Link>
				</div>
			</div>
		</footer>
	);
}
