import { m } from "@oliumbi/i18n/messages";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getSite, type SiteId } from "../../model/sites";

/*
 * The public site has a different host than Studio. Production domains are
 * stable; the disposable test host exposes each site as the same subdomain
 * under the Studio host (for example studio.…sslip.io -> zelglihof.…sslip.io).
 */
function resolveOrigin(site: SiteId) {
	const host = window.location.hostname;
	if (host.endsWith(".sslip.io")) {
		const base = host.split(".").slice(1).join(".");
		return `https://${site}.${base}`;
	}
	return `https://${getSite(site).domain}`;
}

export function PublicSiteLink({
	site,
	path = "/",
	label,
	className,
}: {
	site: SiteId;
	path?: string;
	label?: string;
	className?: string;
}) {
	const [origin, setOrigin] = useState<string | null>(null);

	useEffect(() => {
		setOrigin(resolveOrigin(site));
	}, [site]);

	if (!origin) return null;

	return (
		<a
			href={`${origin}${path}`}
			target="_blank"
			rel="noreferrer"
			className={[
				"inline-flex min-h-10 items-center justify-center gap-2 rounded-control border border-line-control bg-layer-1 px-4 text-sm font-medium text-fg transition-colors hover:border-fg-subtle hover:bg-layer-2",
				className ?? "",
			].join(" ")}
		>
			{label ?? m.studio_open_website()}
			<ArrowUpRight size={15} aria-hidden="true" />
		</a>
	);
}
