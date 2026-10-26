import { m } from "@oliumbi/i18n/messages";
import { Camera } from "lucide-react";
import { instagramUrl } from "../model/links";

export function StoriesIntroduction() {
	return (
		<section className="shell stories-page compact">
			<div>
				<p className="kicker">{m.jublawoma_stories_eyebrow()}</p>
				<h1>
					{m.jublawoma_stories_title()}
					<br />
					{m.jublawoma_stories_title_accent()}
				</h1>
				<p>{m.jublawoma_stories_description()}</p>
				<a
					className="button dark"
					href={instagramUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					<Camera size={17} aria-hidden="true" />
					{m.jublawoma_stories_instagram_updates()}
				</a>
			</div>
			<div className="story-art">
				<img src="/assets/images/doodles/selfie.svg" alt="" />
			</div>
		</section>
	);
}
