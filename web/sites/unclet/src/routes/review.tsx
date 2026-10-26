import { m } from "@oliumbi/i18n/messages";
import { reviewSchema } from "@oliumbi/unclet-data/forms";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHero } from "../components/page-hero";
import { SubmissionForm } from "../components/submission-form";
import { sendReview } from "../data/reviews";
import { pageHead } from "../model/metadata";

export const Route = createFileRoute("/review")({
	head: () => pageHead({ title: m.unclet_review_page_title() }),
	component: ReviewPage,
});

function ReviewPage() {
	const submit = useServerFn(sendReview);
	return (
		<>
			<PageHero
				eyebrow={m.unclet_review_eyebrow()}
				title={m.unclet_review_title()}
				description={m.unclet_review_description()}
			/>
			<section className="shell pb-24 md:pb-32">
				<div className="relative overflow-hidden border border-bone/15 bg-gradient-card bg-coal p-[clamp(1.5rem,5vw,4rem)] before:absolute before:top-0 before:left-0 before:h-0.5 before:w-28 before:bg-brass before:content-[''] mx-auto max-w-3xl">
					<SubmissionForm
						schema={reviewSchema}
						submit={(data) => submit({ data })}
						success={() => m.unclet_review_success()}
						fields={[
							{
								name: "stars",
								label: m.unclet_review_stars(),
								kind: "rating",
								max: 5,
								required: true,
							},
							{
								name: "name",
								label: m.unclet_review_name(),
								kind: "text",
								placeholder: m.unclet_inquiry_name_placeholder(),
								required: true,
							},
							{
								name: "description",
								label: m.unclet_review_feedback_label(),
								kind: "textarea",
								rows: 5,
								placeholder: m.unclet_review_placeholder(),
								required: true,
							},
						]}
						submitLabel={m.unclet_review_submit()}
					/>
					<p className="mt-5 text-sm leading-relaxed text-bone/50">
						{m.unclet_review_consent()}
					</p>
				</div>
			</section>
		</>
	);
}
