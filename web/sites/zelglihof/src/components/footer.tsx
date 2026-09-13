import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin, Sprout } from "lucide-react";

export default function Footer() {
	return (
		<footer className="mt-24 bg-forest text-cream">
			<div className="shell grid gap-14 py-14 md:grid-cols-[1.3fr_0.7fr_0.7fr] md:py-20">
				<div className="max-w-md">
					<div className="flex items-center gap-3">
						<span className="grid size-11 place-items-center rounded-full bg-sun text-ink">
							<Sprout size={21} />
						</span>
						<span className="font-serif text-3xl font-bold">
							{m.zelglihof_components_footer_footer_text()}
						</span>
					</div>
					<p className="mt-6 text-lg leading-relaxed text-cream/72">
						{m.zelglihof_components_footer_footer_paragraph()}
					</p>
				</div>
				<div>
					<p className="eyebrow text-sun">
						{m.zelglihof_components_footer_footer_paragraph_2()}
					</p>
					<nav className="mt-6 grid gap-3 text-sm font-semibold">
						<Link to="/latest" className="hover:text-sun">
							{m.zelglihof_components_footer_footer_text_2()}
						</Link>
						<Link to="/products" className="hover:text-sun">
							{m.zelglihof_components_footer_footer_text_3()}
						</Link>
						<Link to="/about" className="hover:text-sun">
							{m.zelglihof_components_footer_footer_text_4()}
						</Link>
						<Link to="/contact" className="hover:text-sun">
							{m.zelglihof_components_footer_footer_text_5()}
						</Link>
					</nav>
				</div>
				<div>
					<p className="eyebrow text-sun">
						{m.zelglihof_components_footer_footer_paragraph_3()}
					</p>
					<a
						href="https://www.openstreetmap.org/search?query=Zelgliweg%202%2C%205506%20M%C3%A4genwil"
						target="_blank"
						rel="noreferrer"
						className="mt-6 flex items-start gap-2 text-sm leading-relaxed text-cream/75 hover:text-cream"
					>
						<MapPin className="mt-0.5 shrink-0" size={17} />
						<span>
							{m.zelglihof_components_footer_footer_text_6()}
							<br />
							{m.zelglihof_components_footer_footer_text_7()}
						</span>
						<ArrowUpRight className="mt-0.5 shrink-0" size={15} />
					</a>
				</div>
			</div>
			<div className="border-t border-white/12">
				<div className="shell flex flex-col gap-4 py-6 text-xs text-cream/50 md:flex-row md:items-center md:justify-between">
					<p>
						© {new Date().getFullYear()}
						{m.zelglihof_components_footer_footer_paragraph_4()}
					</p>
					<div className="flex flex-wrap gap-x-5 gap-y-2">
						<Link to="/legal" className="hover:text-cream">
							{m.zelglihof_components_footer_footer_text_8()}
						</Link>
						<Link to="/privacy" className="hover:text-cream">
							{m.zelglihof_components_footer_footer_text_9()}
						</Link>
						<Link to="/terms" className="hover:text-cream">
							{m.zelglihof_components_footer_footer_text_10()}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
