import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
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
	const done =
		mutation.data?.outcome === "confirmed" ||
		mutation.data?.outcome === "already-confirmed";
	let error: string | null = null;
	if (mutation.isError) error = m.zelglihof_newsletter_confirm_retry();
	else if (mutation.isSuccess && !done)
		error = m.zelglihof_newsletter_confirm_invalid_link();
	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="mb-8 font-serif text-4xl font-bold">
				{m.zelglihof_newsletter_confirm_title()}
			</h1>
			<FormFeedback
				success={done ? m.zelglihof_newsletter_confirm_success() : null}
				error={error}
			/>
			{!done && (
				<Button
					className="mt-8 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white"
					disabled={mutation.isPending}
					onClick={() => mutation.mutate()}
				>
					{m.zelglihof_newsletter_confirm_submit()}
				</Button>
			)}
		</section>
	);
}
