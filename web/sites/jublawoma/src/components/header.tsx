import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
	{ to: "/anlaesse", label: "Anlässe" },
	{ to: "/geschichten", label: "Geschichten" },
	{ to: "/ueber-uns", label: "Über uns" },
	{ to: "/mitmachen", label: "Mitmachen" },
] as const;

export function Header() {
	const [open, setOpen] = useState(false);
	return (
		<header className="site-header">
			<Link to="/" className="brand" onClick={() => setOpen(false)}>
				<img src="/assets/images/logos/logo.png" alt="" />
				<span>
					<strong>Jubla Woma</strong>
					<small>Wohlenschwil · Mägenwil</small>
				</span>
			</Link>
			<button
				className="menu-button"
				type="button"
				aria-label="Menü"
				onClick={() => setOpen(!open)}
			>
				{open ? <X /> : <Menu />}
			</button>
			<nav className={open ? "site-nav open" : "site-nav"}>
				{links.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						activeProps={{ className: "active" }}
						onClick={() => setOpen(false)}
					>
						{item.label}
					</Link>
				))}
				<a
					className="nav-cta"
					href="/assets/documents/Anmeldung-Jubla-Woma.pdf"
					target="_blank"
					rel="noopener"
				>
					Anmelden
				</a>
			</nav>
		</header>
	);
}
