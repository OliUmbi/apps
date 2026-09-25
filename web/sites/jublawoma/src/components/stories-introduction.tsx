import { m } from "@oliumbi/i18n/messages";
import { Camera } from "lucide-react";

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
					href="https://www.instagram.com/jubla_woma/"
					target="_blank"
					rel="noreferrer"
				>
					<Camera size={17} />
					{m.jublawoma_stories_instagram_updates()}
				</a>
			</div>
			<div className="story-art">
				<img src="/assets/images/doodles/selfie.svg" alt="" />
			</div>
		</section>
	);
}
