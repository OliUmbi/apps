import type { ReactNode } from "react";

export function PageHero({
	eyebrow,
	title,
	intro,
	image,
}: Readonly<{
	eyebrow: string;
	title: ReactNode;
	intro: string;
	image?: string;
}>) {
	return (
		<section className="relative overflow-hidden border-b border-bone/10 pt-20">
			{image ? (
				<>
					<img
						src={image}
						alt=""
						className="absolute inset-0 size-full object-cover opacity-35"
					/>
					<div className="absolute inset-0 bg-gradient-to-r from-night via-night/90 to-night/35" />
				</>
			) : null}
			<div className="shell relative z-10 flex min-h-[62svh] items-end py-16 md:py-24">
				<div className="max-w-5xl">
					<p className="eyebrow text-brass">{eyebrow}</p>
					<h1 className="display-title mt-6 text-6xl md:text-8xl lg:text-9xl">
						{title}
					</h1>
					<p className="mt-8 max-w-2xl text-lg leading-relaxed text-bone/60 md:text-xl">
						{intro}
					</p>
				</div>
			</div>
		</section>
	);
}
