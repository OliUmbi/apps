import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ScanLine } from "lucide-react";

export function NotFound() {
	return (
		<main className="login-page">
			<div className="relative w-[min(100%,390px)] rounded-xl border border-border bg-[rgb(21_21_24/92%)] shadow-[0_30px_90px_rgb(0_0_0/45%),inset_0_1px_rgb(255_255_255/4%)] not-found-panel">
				<div className="flex items-center gap-2.5 border-b border-border-soft px-5 py-[17px] text-sm font-semibold">
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
