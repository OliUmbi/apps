import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { Alert } from "@oliumbi/ui/alert";
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
	const outcome = mutation.data?.outcome;
	const done = outcome === "unsubscribed" || outcome === "already-unsubscribed";
	// An unknown link is terminal: no action can still succeed on it, so it
	// gets its own copy and no retry. Only a transport failure is retryable.
	const invalid = outcome === "invalid";
	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="mb-8 font-serif text-4xl font-bold">
				{m.zelglihof_newsletter_unsubscribe_title()}
			</h1>
			<Alert tone={done ? "success" : "error"}>
				{done
					? m.zelglihof_newsletter_unsubscribe_success()
					: invalid
						? m.zelglihof_newsletter_unsubscribe_invalid_link()
						: mutation.isError
							? m.zelglihof_newsletter_unsubscribe_retry()
							: null}
			</Alert>
			{!done && !invalid && (
				<Button
					className="cta mt-8"
					disabled={mutation.isPending}
					onClick={() => mutation.mutate()}
				>
					{m.zelglihof_newsletter_unsubscribe_submit()}
				</Button>
			)}
		</section>
	);
}
