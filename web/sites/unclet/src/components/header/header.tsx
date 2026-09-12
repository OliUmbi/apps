import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Dialog } from "../ui/index";

const links = [
	{ label: m.unclet_components_header_header_label(), to: "/services" },
	{ label: m.unclet_components_header_header_label_2(), to: "/showcases" },
	{ label: m.unclet_components_header_header_label_3(), to: "/about" },
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
							alt={m.unclet_components_header_header_text_2()}
							className="h-10 w-auto brightness-0 invert"
						/>
					</Link>
					<nav
						className="hidden items-center gap-8 md:flex"
						aria-label={m.unclet_components_header_header_aria_label()}
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
						<Link to="/inquiry" className="button-primary min-h-11 px-5">
							{m.unclet_components_header_header_text_3()}
						</Link>
					</nav>
					<Dialog.Trigger
						type="button"
						className="grid size-11 place-items-center border border-bone/20 md:hidden"
						aria-expanded={open}
						aria-label={
							open
								? m.unclet_components_header_header_feedback()
								: m.unclet_components_header_header_feedback_2()
						}
					>
						{open ? <X size={20} /> : <Menu size={20} />}
					</Dialog.Trigger>
				</div>
				<Dialog.Portal>
					<Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60" />
					<Dialog.Popup className="fixed inset-x-4 top-4 z-60 max-h-[90vh] overflow-auto border border-bone/20 bg-night p-5 text-bone">
						<div className="flex items-center justify-between">
							<Dialog.Title>
								{m.unclet_components_header_header_aria_label_2()}
							</Dialog.Title>
							<Dialog.Close aria-label={m.cancel()} className="p-3">
								<X />
							</Dialog.Close>
						</div>
						<nav
							className="border-t border-bone/10 bg-night px-4 py-6 md:hidden"
							aria-label={m.unclet_components_header_header_aria_label_2()}
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
									to="/inquiry"
									className="button-primary mt-5"
									onClick={() => setOpen(false)}
								>
									{m.unclet_components_header_header_text_4()}
								</Link>
							</div>
						</nav>
					</Dialog.Popup>
				</Dialog.Portal>
			</header>
		</Dialog.Root>
	);
}
