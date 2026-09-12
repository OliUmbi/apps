import { m } from "@oliumbi/i18n/messages";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { PageHero } from "../components/page-hero";
import { SubmissionForm } from "../components/ui/submission-form";
import { sendReview } from "../review/review.functions";
import { reviewSchema } from "../review/review.schema";

export const Route = createFileRoute("/review")({
	head: () => ({ meta: [{ title: m.unclet_review_page_title() }] }),
	component: ReviewPage,
});

function ReviewPage() {
	const submit = useServerFn(sendReview);
	return (
		<>
			<PageHero
				eyebrow={m.unclet_review_eyebrow()}
				title={m.unclet_review_heading()}
				intro={m.unclet_review_intro()}
			/>
			<section className="shell pb-24 md:pb-32">
				<div className="review-form-card mx-auto max-w-3xl">
					<SubmissionForm
						schema={reviewSchema}
						submit={(data) => submit({ data })}
						success={m.unclet_review_success()}
						fields={[
							{
								name: "stars",
								label: m.unclet_review_stars(),
								type: "rating",
								min: 1,
								max: 5,
								step: 1,
								required: true,
							},
							{
								name: "name",
								label: m.unclet_review_name(),
								placeholder: m.unclet_inquiry_name_placeholder(),
								required: true,
							},
							{
								name: "description",
								label: m.unclet_review_description(),
								type: "textarea",
								placeholder: m.unclet_review_placeholder(),
								required: true,
							},
						]}
						submitLabel={m.unclet_review_submit()}
					/>
					<p className="mt-5 text-sm leading-relaxed text-bone/50">
						{m.unclet_review_moderation()}
					</p>
				</div>
			</section>
		</>
	);
}
