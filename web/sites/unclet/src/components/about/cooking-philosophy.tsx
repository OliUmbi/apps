import { m } from "@oliumbi/i18n/messages";

export function CookingPhilosophy() {
	return (
		<section className="bg-paper py-24 text-night md:py-32">
			<div className="measure">
				<p className="eyebrow text-brass">
					{m.unclet_about_philosophy_eyebrow()}
				</p>
				<blockquote className="display-title mt-8 text-5xl md:text-7xl">
					{m.unclet_about_philosophy_quote()}
				</blockquote>
				<div className="mt-12 grid gap-8 text-lg leading-relaxed text-night/65 md:grid-cols-2">
					<p>{m.unclet_about_philosophy_conversation_body()}</p>
					<p>{m.unclet_about_philosophy_menu_body()}</p>
				</div>
			</div>
		</section>
	);
}
