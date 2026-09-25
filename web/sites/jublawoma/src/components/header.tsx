import { Dialog } from "@base-ui/react/dialog";
import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
	{ to: "/donations", label: m.jublawoma_navigation_help },
	{ to: "/events", label: m.jublawoma_navigation_events },
	{ to: "/stories", label: m.jublawoma_navigation_stories },
	{ to: "/about", label: m.jublawoma_navigation_about },
	{ to: "/join", label: m.jublawoma_navigation_join },
] as const;

export function Header() {
	const [open, setOpen] = useState(false);
	return (
		<header className="site-header">
			<Link to="/" className="brand" onClick={() => setOpen(false)}>
				<img src="/assets/images/logos/logo.png" alt="" />
				<span>
					<strong>{m.jublawoma_brand()}</strong>
					<small>{m.jublawoma_region()}</small>
				</span>
			</Link>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger
					className="menu-button"
					type="button"
					aria-expanded={open}
					aria-label={open ? m.close_menu() : m.open_menu()}
				>
					{open ? <X /> : <Menu />}
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-bark/35" />
					<Dialog.Popup className="fixed inset-y-0 right-0 z-60 w-full max-w-sm overflow-y-auto bg-oat p-7 text-bark shadow-2xl">
						<div className="flex items-center justify-between">
							<Dialog.Title>{m.menu()}</Dialog.Title>
							<Dialog.Close aria-label={m.close_menu()} className="p-3">
								<X />
							</Dialog.Close>
						</div>
						<nav className="grid gap-3 py-4" aria-label={m.mobile_navigation()}>
							{links.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									onClick={() => setOpen(false)}
									className="border-b border-bark/15 py-3 text-xl"
								>
									{item.label()}
								</Link>
							))}
							<a
								className="nav-cta"
								href="/assets/documents/Anmeldung-Jubla-Woma.pdf"
								target="_blank"
								rel="noopener"
							>
								{m.jublawoma_navigation_register()}
							</a>
						</nav>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
			<nav className="site-nav" aria-label={m.main_navigation()}>
				{links.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						activeProps={{ className: "active" }}
					>
						{item.label()}
					</Link>
				))}
				<a
					className="nav-cta"
					href="/assets/documents/Anmeldung-Jubla-Woma.pdf"
					target="_blank"
					rel="noopener"
				>
					{m.jublawoma_navigation_register()}
				</a>
			</nav>
		</header>
	);
}
