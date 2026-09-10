import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Dialog } from "./ui/index";

const links = [
	{ to: "/donations", label: m.jublawoma_components_header_label() },
	{ to: "/events", label: m.jublawoma_components_header_label_2() },
	{ to: "/stories", label: m.jublawoma_components_header_label_3() },
	{ to: "/about", label: m.jublawoma_components_header_label_4() },
	{ to: "/join", label: m.jublawoma_components_header_label_5() },
] as const;

export function Header() {
	const [open, setOpen] = useState(false);
	return (
		<header className="site-header">
			<Link to="/" className="brand" onClick={() => setOpen(false)}>
				<img src="/assets/images/logos/logo.png" alt="" />
				<span>
					<strong>{m.jublawoma_components_header_text()}</strong>
					<small>{m.jublawoma_components_header_text_2()}</small>
				</span>
			</Link>
			<Dialog.Root open={open} onOpenChange={setOpen}>
				<Dialog.Trigger
					className="menu-button"
					type="button"
					aria-label={m.jublawoma_components_header_aria_label()}
				>
					{open ? <X /> : <Menu />}
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-bark/35" />
					<Dialog.Popup className="fixed inset-x-4 top-4 z-60 rounded-3xl bg-oat p-6 text-bark shadow-xl">
						<div className="flex items-center justify-between">
							<Dialog.Title>
								{m.jublawoma_components_header_aria_label()}
							</Dialog.Title>
							<Dialog.Close aria-label={m.cancel()} className="p-3">
								<X />
							</Dialog.Close>
						</div>
						<nav className="grid gap-3 py-4">
							{links.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									onClick={() => setOpen(false)}
									className="border-b border-bark/15 py-3 text-xl"
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
								{m.jublawoma_components_header_text_3()}
							</a>
						</nav>
					</Dialog.Popup>
				</Dialog.Portal>
			</Dialog.Root>
			<nav className="site-nav">
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
					{m.jublawoma_components_header_text_3()}
				</a>
			</nav>
		</header>
	);
}
