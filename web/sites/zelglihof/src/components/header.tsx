import { Drawer } from "@base-ui/react/drawer";
import { m } from "@oliumbi/i18n/messages";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Menu, Sprout, X } from "lucide-react";
import { useState } from "react";

const links = [
	{ label: m.zelglihof_components_header_header_label(), to: "/latest" },
	{ label: m.zelglihof_components_header_header_label_2(), to: "/products" },
	{ label: m.zelglihof_components_header_header_label_3(), to: "/about" },
	{ label: m.zelglihof_components_header_header_label_4(), to: "/contact" },
];

export default function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-forest/10 bg-oat/90 backdrop-blur-xl">
			<div className="shell flex h-20 items-center justify-between gap-6">
				<Brand />
				<nav
					className="hidden items-center gap-7 lg:flex"
					aria-label={m.zelglihof_components_header_header_aria_label()}
				>
					{links.map((link) => (
						<Link
							key={link.to}
							to={link.to}
							className="border-b border-transparent py-2 text-sm font-semibold text-ink/65 hover:text-ink data-[status=active]:border-clay data-[status=active]:text-ink"
						>
							{link.label}
						</Link>
					))}
				</nav>
				<div className="hidden lg:block">
					<Link to="/products" className="button-primary">
						{m.zelglihof_components_header_header_text()}
						<ArrowUpRight size={17} />
					</Link>
				</div>
				<MobileMenu />
			</div>
		</header>
	);
}

function Brand() {
	return (
		<Link
			to="/"
			className="group flex items-center gap-3"
			aria-label={m.zelglihof_components_header_header_aria_label_2()}
		>
			<span className="grid size-10 place-items-center rounded-full bg-forest text-cream transition-transform group-hover:-rotate-6">
				<Sprout size={20} strokeWidth={1.8} />
			</span>
			<span className="leading-none">
				<span className="block font-serif text-xl font-bold tracking-tight">
					{m.zelglihof_components_header_header_text_2()}
				</span>
				<span className="mt-1 block text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink/50">
					{m.zelglihof_components_header_header_text_3()}
				</span>
			</span>
		</Link>
	);
}

function MobileMenu() {
	const [open, setOpen] = useState(false);
	return (
		<Drawer.Root swipeDirection="right" open={open} onOpenChange={setOpen}>
			<Drawer.Trigger
				className="grid size-11 place-items-center rounded-full border border-forest/20 lg:hidden"
				aria-label={m.zelglihof_components_header_header_aria_label_3()}
			>
				<Menu size={21} />
			</Drawer.Trigger>
			<Drawer.Portal>
				<Drawer.Backdrop className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-sm" />
				<Drawer.Viewport className="fixed inset-0 z-50 flex justify-end">
					<Drawer.Popup className="h-full w-[min(90vw,28rem)] bg-forest p-6 text-cream shadow-2xl">
						<Drawer.Content className="flex h-full flex-col">
							<div className="flex items-center justify-between">
								<Drawer.Title className="font-serif text-2xl font-bold">
									{m.zelglihof_components_header_header_text_4()}
								</Drawer.Title>
								<Drawer.Close
									className="grid size-11 place-items-center rounded-full border border-white/20"
									aria-label={m.zelglihof_components_header_header_aria_label_4()}
								>
									<X size={21} />
								</Drawer.Close>
							</div>
							<nav
								className="my-auto grid gap-2"
								aria-label={m.zelglihof_components_header_header_aria_label_5()}
							>
								{links.map((link, index) => (
									<Link
										key={link.to}
										to={link.to}
										onClick={() => setOpen(false)}
										className="group flex items-center gap-4 border-b border-white/15 py-4 font-serif text-3xl font-bold"
									>
										<span className="font-sans text-xs font-semibold text-sun">
											0{index + 1}
										</span>
										{link.label}
									</Link>
								))}
							</nav>
							<p className="text-sm text-cream/60">
								{m.zelglihof_components_header_header_paragraph()}
							</p>
						</Drawer.Content>
					</Drawer.Popup>
				</Drawer.Viewport>
			</Drawer.Portal>
		</Drawer.Root>
	);
}
