import { m } from "@oliumbi/i18n/messages";
import { SimpleMarkdown } from "@oliumbi/ui/simple-markdown";
import type { PublicShowcase } from "../model/content";
import { ShowcaseFacts } from "./showcase-facts";

export function ShowcaseDescription({
	showcase,
}: {
	showcase: PublicShowcase;
}) {
	return (
		<div className="showcase-body lg:sticky lg:top-28 lg:self-start">
			<p className="eyebrow text-brass">{m.unclet_showcase_event()}</p>
			<h1 className="display-title mt-7 text-5xl md:text-6xl xl:text-7xl">
				{showcase.title}
			</h1>
			<ShowcaseFacts showcase={showcase} />
			<div className="rule my-8" />
			<SimpleMarkdown value={showcase.body} className="unclet-markdown" />
		</div>
	);
}
