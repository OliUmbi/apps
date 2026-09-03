import { Link } from "@tanstack/react-router";
import { Camera } from "lucide-react";

export function Footer() {
	return (
		<footer className="footer">
			<div className="shell footer-grid">
				<div>
					<p className="footer-title">
						Draussen zuhause.
						<br />
						Miteinander unterwegs.
					</p>
					<p>Jungwacht Blauring Wohlenschwil Mägenwil</p>
				</div>
				<div>
					<strong>Kontakt</strong>
					<a href="mailto:scharleitung@jublawoma.ch">
						scharleitung@jublawoma.ch
					</a>
					<span>Vogelsangstrasse 2 · 5512 Wohlenschwil</span>
				</div>
				<div>
					<strong>Mehr</strong>
					<a
						href="https://www.instagram.com/jubla_woma/"
						target="_blank"
						rel="noreferrer"
					>
						<Camera size={16} /> Instagram
					</a>
					<Link to="/impressum">Impressum</Link>
					<Link to="/datenschutz">Datenschutz</Link>
				</div>
			</div>
		</footer>
	);
}
