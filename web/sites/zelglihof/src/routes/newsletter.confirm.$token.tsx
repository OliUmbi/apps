import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { Alert } from "@oliumbi/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { confirmNewsletterSignup } from "../data/newsletter";

export const Route = createFileRoute("/newsletter/confirm/$token")({
	component: NewsletterConfirmationPage,
});
function NewsletterConfirmationPage() {
	const { token } = Route.useParams();
	const submit = useServerFn(confirmNewsletterSignup);
	const mutation = useMutation({
		mutationFn: () => submit({ data: { token } }),
	});
	const outcome = mutation.data?.outcome;
	const done = outcome === "confirmed" || outcome === "already-confirmed";
	// Invalid and expired links are terminal: no action can still succeed on
	// them, so they get their own copy and no retry. Only a transport failure
	// (no outcome at all) is worth trying again.
	const invalid = outcome === "invalid";
	const expired = outcome === "expired";
	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="mb-8 font-serif text-4xl font-bold">
				{m.zelglihof_newsletter_confirm_title()}
			</h1>
			<Alert tone={done ? "success" : "error"}>
				{done
					? m.zelglihof_newsletter_confirm_success()
					: invalid
						? m.zelglihof_newsletter_confirm_invalid_link()
						: expired
							? m.zelglihof_newsletter_confirm_expired()
							: mutation.isError
								? m.zelglihof_newsletter_confirm_retry()
								: null}
			</Alert>
			{!done && !invalid && !expired && (
				<Button
					className="cta mt-8"
					disabled={mutation.isPending}
					onClick={() => mutation.mutate()}
				>
					{m.zelglihof_newsletter_confirm_submit()}
				</Button>
			)}
			{expired && (
				<Link to="/" hash="newsletter" className="cta mt-8">
					{m.zelglihof_newsletter_confirm_resignup()}
				</Link>
			)}
		</section>
	);
}
