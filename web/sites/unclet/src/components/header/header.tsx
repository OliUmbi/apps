import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
	{ label: "Angebot", to: "/angebot" },
	{ label: "Einblicke", to: "/einblicke" },
	{ label: "Über Thomas", to: "/ueber-mich" },
] as const;

export default function Header() {
	const [open, setOpen] = useState(false);
	return (
		<header className="fixed inset-x-0 top-0 z-40 border-b border-bone/10 bg-night/85 backdrop-blur-xl">
			<div className="shell flex h-20 items-center justify-between">
				<Link
					to="/"
					className="flex items-center gap-3"
					onClick={() => setOpen(false)}
				>
					<span className="grid size-9 place-items-center border border-brass/60 font-serif text-xl text-brass-light">
						T
					</span>
					<span className="text-sm font-bold tracking-[0.22em] uppercase">
						Uncle-T
					</span>
				</Link>
				<nav
					className="hidden items-center gap-8 md:flex"
					aria-label="Hauptnavigation"
				>
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="text-xs font-semibold tracking-[0.12em] text-bone/65 uppercase transition hover:text-brass-light"
							activeProps={{ className: "text-brass-light" }}
						>
							{link.label}
						</Link>
					))}
					<Link to="/anfragen" className="button-primary min-h-11 px-5">
						Anlass anfragen
					</Link>
				</nav>
				<button
					type="button"
					className="grid size-11 place-items-center border border-bone/20 md:hidden"
					onClick={() => setOpen((value) => !value)}
					aria-expanded={open}
					aria-label={open ? "Menü schliessen" : "Menü öffnen"}
				>
					{open ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>
			{open ? (
				<nav
					className="border-t border-bone/10 bg-night px-4 py-6 md:hidden"
					aria-label="Mobile Navigation"
				>
					<div className="flex flex-col gap-1">
						{links.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="border-b border-bone/10 py-4 text-lg"
								onClick={() => setOpen(false)}
							>
								{link.label}
							</Link>
						))}
						<Link
							to="/anfragen"
							className="button-primary mt-5"
							onClick={() => setOpen(false)}
						>
							Anlass anfragen
						</Link>
					</div>
				</nav>
			) : null}
		</header>
	);
}
