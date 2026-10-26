import { Dialog } from "@base-ui/react/dialog";
import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
	const [open, setOpen] = useState(false);
	// Messages are resolved per render: module scope would bake one locale in
	// before the request locale is known (U-20).
	const links = [
		{ label: m.unclet_navigation_services(), to: "/services" },
		{ label: m.unclet_navigation_showcases(), to: "/showcases" },
		{ label: m.unclet_navigation_about(), to: "/about" },
	] as const;
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
								className="relative py-[0.45rem] font-mono text-[0.72rem] font-semibold uppercase leading-none tracking-[0.18em] text-bone/60 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-brass after:opacity-0 after:transition-opacity after:content-['] hover:text-brass-light data-[status=active]:text-bone data-[status=active]:after:opacity-100"
							>
								{link.label}
							</Link>
						))}
						<Link
							to="/inquiry"
							className="ml-2 inline-flex items-center gap-2 bg-brass px-5 py-3 text-[0.72rem] font-bold uppercase tracking-[0.13em] text-night transition-colors hover:bg-brass-light"
						>
							{m.unclet_inquire()}
							<ArrowRight size={15} aria-hidden="true" />
						</Link>
					</nav>
					<Dialog.Trigger
						type="button"
						className="inline-flex items-center gap-3 rounded-full border border-bone/25 py-2 pl-4 pr-2 text-bone/85 transition-colors hover:border-brass hover:text-brass-light md:hidden"
						aria-expanded={open}
						aria-label={open ? m.close_menu() : m.open_menu()}
					>
						<span className="font-mono text-[0.66rem] font-semibold uppercase leading-none tracking-[0.18em]">
							{m.mobile_navigation()}
						</span>
						<span className="grid size-7 place-items-center rounded-full border border-bone/20">
							{open ? (
								<X size={14} aria-hidden="true" />
							) : (
								<Menu size={14} aria-hidden="true" />
							)}
						</span>
					</Dialog.Trigger>
				</div>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70" />
					<Dialog.Popup className="fixed inset-y-0 right-0 z-60 flex w-full max-w-sm flex-col overflow-y-auto border-l border-bone/15 bg-night text-bone shadow-2xl">
						<div className="flex items-center justify-between px-6 pt-6">
							<Dialog.Title className="font-mono text-[0.66rem] font-semibold uppercase leading-none tracking-[0.18em] text-brass-light">
								{m.mobile_navigation()}
							</Dialog.Title>
							<Dialog.Close
								aria-label={m.close_menu()}
								className="grid size-10 place-items-center rounded-full border border-bone/25 text-bone/80 transition-colors hover:border-brass hover:text-brass-light"
							>
								<X size={17} aria-hidden="true" />
							</Dialog.Close>
						</div>
						<nav
							className="flex flex-1 flex-col justify-between gap-10 px-6 pb-8 pt-8"
							aria-label={m.mobile_navigation()}
						>
							<ul>
								{links.map((link, index) => (
									<li key={link.to}>
										<Link
											to={link.to}
											onClick={() => setOpen(false)}
											className="group flex items-baseline gap-4 border-b border-bone/10 py-4 text-bone data-[status=active]:text-brass-light"
										>
											<span className="font-mono text-[0.66rem] font-semibold uppercase leading-none tracking-[0.18em] text-brass/70">
												{String(index + 1).padStart(2, "0")}
											</span>
											<span className="flex-1 font-serif text-[1.75rem] leading-tight tracking-[-0.02em] transition-colors group-hover:text-brass-light">
												{link.label}
											</span>
											<ArrowRight
												size={17}
												aria-hidden="true"
												className="shrink-0 self-center text-brass/40 transition-colors group-hover:text-brass-light"
											/>
										</Link>
									</li>
								))}
							</ul>
							<div>
								<Link
									to="/inquiry"
									onClick={() => setOpen(false)}
									className="cta w-full"
								>
									{m.unclet_inquire()}
									<ArrowRight size={15} aria-hidden="true" />
								</Link>
								<p className="mt-5 text-xs leading-relaxed text-bone/45">
									{m.unclet_footer_address()}
								</p>
							</div>
						</nav>
					</Dialog.Popup>
				</Dialog.Portal>
			</header>
		</Dialog.Root>
	);
}
