import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Button, FormFeedback } from "../../../components/ui/index";
import { confirmNewsletterSignup } from "../../../newsletter/newsletter.functions";
export const Route = createFileRoute("/newsletter/confirm/$token")({
	component: Page,
});
function Page() {
	const { token } = Route.useParams();
	const submit = useServerFn(confirmNewsletterSignup);
	const mutation = useMutation({
		mutationFn: () =>
			submit({ data: { token } }) as Promise<{ outcome: string }>,
	});
	const done = ["confirmed", "already-confirmed"].includes(
		mutation.data?.outcome ?? "",
	);
	return (
		<section className="mx-auto max-w-xl px-4 py-24 text-center">
			<h1 className="mb-8 font-serif text-4xl font-bold">
				{m.zelglihof_routes_newsletter_confirm_token_heading()}
			</h1>
			<FormFeedback
				success={
					done ? m.zelglihof_routes_newsletter_confirm_token_feedback() : null
				}
				error={
					mutation.isError
						? m.zelglihof_routes_newsletter_confirm_token_feedback_2()
						: mutation.isSuccess && !done
							? m.zelglihof_routes_newsletter_confirm_token_feedback_3()
							: null
				}
			/>
			{!done && (
				<Button
					className="mt-8 rounded-lg bg-emerald-900 px-5 py-3 font-semibold text-white"
					disabled={mutation.isPending}
					onClick={() => mutation.mutate()}
				>
					{m.zelglihof_routes_newsletter_confirm_token_text()}
				</Button>
			)}
		</section>
	);
}
