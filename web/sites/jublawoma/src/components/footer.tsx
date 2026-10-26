import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";
import { contactMailto, instagramUrl } from "../model/links";

export function Footer() {
	return (
		<footer className="bg-bark py-20 text-oat-soft">
			<div className="shell footer-grid">
				<div>
					<p className="mb-8 text-white text-2xl font-black tracking-[-0.04em]">
						{m.jublawoma_footer_title()}
						<br />
						{m.jublawoma_footer_description()}
					</p>
					<p>{m.jublawoma_organization()}</p>
				</div>
				<div>
					<strong>{m.contact()}</strong>
					<a href={contactMailto}>{m.jublawoma_email()}</a>
					<span>{m.jublawoma_footer_address()}</span>
				</div>
				<div>
					<strong>{m.jublawoma_footer_more()}</strong>
					<a href={instagramUrl} target="_blank" rel="noopener noreferrer">
						<Camera size={16} aria-hidden="true" />
						{m.jublawoma_footer_instagram()}
					</a>
					<Link to="/legal">{m.imprint()}</Link>
					<Link to="/privacy">{m.privacy()}</Link>
				</div>
			</div>
		</footer>
	);
}
