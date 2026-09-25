import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export function Footer() {
	return (
		<footer className="footer">
			<div className="shell footer-grid">
				<div>
					<p className="footer-title">
						{m.jublawoma_footer_title()}
						<br />
						{m.jublawoma_footer_description()}
					</p>
					<p>{m.jublawoma_organization()}</p>
				</div>
				<div>
					<strong>{m.contact()}</strong>
					<a href="mailto:scharleitung@jublawoma.ch">{m.jublawoma_email()}</a>
					<span>{m.jublawoma_footer_address()}</span>
				</div>
				<div>
					<strong>{m.jublawoma_footer_more()}</strong>
					<a
						href="https://www.instagram.com/jubla_woma/"
						target="_blank"
						rel="noreferrer"
					>
						<Camera size={16} />
						{m.jublawoma_footer_instagram()}
					</a>
					<Link to="/legal">{m.imprint()}</Link>
					<Link to="/privacy">{m.privacy()}</Link>
				</div>
			</div>
		</footer>
	);
}
