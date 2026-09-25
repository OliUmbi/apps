import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ScanLine } from "lucide-react";

export function NotFound() {
	return (
		<main className="login-page">
			<div className="login-panel not-found-panel">
				<div className="login-brand">
					<span className="brand-mark large">O</span>
					{m.studio_brand()}
				</div>
				<div className="not-found-code">
					<ScanLine size={24} aria-hidden="true" />
					<span>ERR / 404</span>
				</div>
				<div className="login-body">
					<p className="page-kicker">{m.studio_system()}</p>
					<h1>{m.studio_not_found_title()}</h1>
					<p>{m.studio_not_found_description()}</p>
					<Link
						to="/"
						search={{
							site: "zelglihof",
							area: "site",
							section: "overview",
							mode: "list",
						}}
						className="button primary mt-6"
					>
						<ArrowLeft size={15} aria-hidden="true" />
						{m.studio_back_to_studio()}
					</Link>
				</div>
			</div>
		</main>
	);
}
