import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { unsubscribeFromNewsletter } from "../data/newsletter";

export const Route = createFileRoute("/newsletter/unsubscribe/$token")({
	component: NewsletterUnsubscribePage,
});
function NewsletterUnsubscribePage() {
	const { token } = Route.useParams();
	const submit = useServerFn(unsubscribeFromNewsletter);
	const mutation = useMutation({
		mutationFn: () => submit({ data: { token } }),
	});
	const done =
		mutation.data?.outcome === "unsubscribed" ||
		mutation.data?.outcome === "already-unsubscribed";
	let error: string | null = null;
	if (mutation.isError) error = m.zelglihof_newsletter_unsubscribe_retry();
	else if (mutation.isSuccess && !done)
		error = m.zelglihof_newsletter_unsubscribe_invalid_link();
	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="mb-8 font-serif text-4xl font-bold">
				{m.zelglihof_newsletter_unsubscribe_title()}
			</h1>
			<FormFeedback
				success={done ? m.zelglihof_newsletter_unsubscribe_success() : null}
				error={error}
			/>
			{!done && (
				<Button
					className="mt-8 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white"
					disabled={mutation.isPending}
					onClick={() => mutation.mutate()}
				>
					{m.zelglihof_newsletter_unsubscribe_submit()}
				</Button>
			)}
		</section>
	);
}
