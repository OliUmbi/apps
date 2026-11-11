import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomePage,
});

const links = [
	{ label: "GitHub", href: "https://github.com/OliUmbi" },
	{ label: "Jublawoma", href: "https://jublawoma.ch" },
	{ label: "Uncle T", href: "https://uncle-t.ch" },
	{ label: "Zelglihof Mägenwil", href: "https://zelglihof-maegenwil.ch" },
];

function HomePage() {
	return (
		<div className="w-full max-w-xl">
			<h1 className="font-display text-5xl leading-[0.95] tracking-[-0.03em] text-ink sm:text-6xl">
				Oliumbi
			</h1>
			<p className="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
				Personal site and experiments.
			</p>
			<nav aria-label="Elsewhere" className="mt-10 sm:mt-12">
				<ul className="flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
					{links.map((link) => (
						<li key={link.href}>
							<a
								className="inline-flex items-baseline gap-1 text-sm font-semibold text-ink underline decoration-line decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
							>
								{link.label}
								<span aria-hidden="true" className="text-muted">
									↗
								</span>
							</a>
						</li>
					))}
				</ul>
			</nav>
			<p className="mt-8 max-w-md text-xs leading-relaxed text-muted">
				Page views are counted anonymously on this server, without cookies,
				identifiers or third-party analytics.
			</p>
		</div>
	);
}
