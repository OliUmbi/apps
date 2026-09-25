import { Dialog } from "@base-ui/react/dialog";
import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
	{ label: m.unclet_navigation_services, to: "/services" },
	{ label: m.unclet_navigation_showcases, to: "/showcases" },
	{ label: m.unclet_navigation_about_chef, to: "/about" },
] as const;

export default function Header() {
	const [open, setOpen] = useState(false);
	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<header className="fixed inset-x-0 top-0 z-40 border-b border-bone/10 bg-night/85 backdrop-blur-xl">
				<div className="shell flex h-20 items-center justify-between">
					<Link
						to="/"
						className="flex items-center gap-3"
						onClick={() => setOpen(false)}
					>
						<img
							src="/logo.png"
							alt={m.unclet_brand()}
							className="h-10 w-auto brightness-0 invert"
						/>
					</Link>
					<nav
						className="hidden items-center gap-8 md:flex"
						aria-label={m.main_navigation()}
					>
						{links.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="text-xs font-semibold tracking-[0.12em] text-bone/65 uppercase transition hover:text-brass-light"
								activeProps={{ className: "text-brass-light" }}
							>
								{link.label()}
							</Link>
						))}
						<Link to="/inquiry" className="button-primary min-h-11 px-5">
							{m.unclet_inquire()}
						</Link>
					</nav>
					<Dialog.Trigger
						type="button"
						className="grid size-11 place-items-center border border-bone/20 md:hidden"
						aria-expanded={open}
						aria-label={open ? m.close_menu() : m.open_menu()}
					>
						{open ? <X size={20} /> : <Menu size={20} />}
					</Dialog.Trigger>
				</div>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
					<Dialog.Popup className="fixed inset-y-0 right-0 z-60 w-full max-w-sm overflow-auto border-l border-bone/20 bg-night p-6 text-bone shadow-2xl">
						<div className="flex items-center justify-between">
							<Dialog.Title>{m.mobile_navigation()}</Dialog.Title>
							<Dialog.Close aria-label={m.close_menu()} className="p-3">
								<X />
							</Dialog.Close>
						</div>
						<nav
							className="mt-4 border-t border-bone/10 bg-night px-1 py-6"
							aria-label={m.mobile_navigation()}
						>
							<div className="flex flex-col gap-1">
								{links.map((link) => (
									<Link
										key={link.to}
										to={link.to}
										className="border-b border-bone/10 py-4 text-lg"
										onClick={() => setOpen(false)}
									>
										{link.label()}
									</Link>
								))}
								<Link
									to="/inquiry"
									className="button-primary mt-5"
									onClick={() => setOpen(false)}
								>
									{m.unclet_inquire()}
								</Link>
							</div>
						</nav>
					</Dialog.Popup>
				</Dialog.Portal>
			</header>
		</Dialog.Root>
	);
}
