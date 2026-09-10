import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export function Footer() {
	return (
		<footer className="footer">
			<div className="shell footer-grid">
				<div>
					<p className="footer-title">
						{m.jublawoma_components_footer_paragraph()}
						<br />
						{m.jublawoma_components_footer_paragraph_2()}
					</p>
					<p>{m.jublawoma_components_footer_paragraph_3()}</p>
				</div>
				<div>
					<strong>{m.jublawoma_components_footer_text()}</strong>
					<a href="mailto:scharleitung@jublawoma.ch">
						{m.jublawoma_components_footer_text_2()}
					</a>
					<span>{m.jublawoma_components_footer_text_3()}</span>
				</div>
				<div>
					<strong>{m.jublawoma_components_footer_text_4()}</strong>
					<a
						href="https://www.instagram.com/jubla_woma/"
						target="_blank"
						rel="noreferrer"
					>
						<Camera size={16} />
						{m.jublawoma_components_footer_text_5()}
					</a>
					<Link to="/legal">{m.jublawoma_components_footer_text_6()}</Link>
					<Link to="/privacy">{m.jublawoma_components_footer_text_7()}</Link>
				</div>
			</div>
		</footer>
	);
}
