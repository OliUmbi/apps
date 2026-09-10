import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import { InquiryForm } from "../components/inquiry-form";
import { PageHero } from "../components/page-hero";

export const Route = createFileRoute("/inquiry")({
	head: () => ({
		meta: [
			{ title: m.unclet_routes_inquiry_title() },
			{
				name: "description",
				content: m.unclet_routes_inquiry_content(),
			},
		],
	}),
	component: InquiryPage,
});

function InquiryPage() {
	return (
		<>
			<PageHero
				eyebrow={m.unclet_routes_inquiry_eyebrow()}
				title={
					<>
						{m.unclet_routes_inquiry_text()}
						<br />
						<span className="text-brass-light italic">
							{m.unclet_routes_inquiry_text_2()}
						</span>
					</>
				}
				intro={m.unclet_routes_inquiry_intro()}
			/>
			<section className="shell grid gap-16 py-20 md:py-28 lg:grid-cols-[.65fr_1.35fr]">
				<aside>
					<p className="eyebrow text-brass">
						{m.unclet_routes_inquiry_paragraph()}
					</p>
					<div className="mt-8 space-y-6 text-bone/60">
						<a
							href="mailto:info@uncle-t.ch"
							className="flex items-center gap-3 hover:text-brass-light"
						>
							<Mail size={18} className="text-brass" />
							{m.unclet_routes_inquiry_text_3()}
						</a>
						<div className="flex items-start gap-3">
							<MapPin size={18} className="mt-1 shrink-0 text-brass" />
							<p>
								{m.unclet_routes_inquiry_paragraph_2()}
								<br />
								{m.unclet_routes_inquiry_paragraph_3()}
								<br />
								{m.unclet_routes_inquiry_paragraph_4()}
							</p>
						</div>
					</div>
					<div className="rule mt-10" />
					<p className="mt-6 text-sm leading-relaxed text-bone/45">
						{m.unclet_routes_inquiry_paragraph_5()}
					</p>
				</aside>
				<InquiryForm />
			</section>
		</>
	);
}
