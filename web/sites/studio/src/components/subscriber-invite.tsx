import { emailSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requestSubscriberConfirmation } from "../server/newsletter.functions";
import { Button, Form, FormFeedback, InputField } from "./ui/index";

export function SubscriberInvite() {
	const request = useServerFn(requestSubscriberConfirmation);
	const cache = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (form: FormData) =>
			request({ data: { email: emailSchema.parse(form.get("email")) } }),
		onSuccess: () =>
			cache.invalidateQueries({
				queryKey: ["records", "zelglihof.subscriber"],
			}),
	});
	return (
		<Form
			className="panel grid gap-4 p-6"
			onSubmit={(event) => {
				event.preventDefault();
				mutation.mutate(new FormData(event.currentTarget));
			}}
		>
			<InputField
				name="email"
				type="email"
				label={m.studio_account_email()}
				required
			/>
			<p className="text-sm text-zinc-400">
				{m.studio_subscriber_invite_help()}
			</p>
			<Button
				type="submit"
				className="button primary"
				disabled={mutation.isPending}
			>
				{m.studio_subscriber_invite()}
			</Button>
			<FormFeedback
				error={mutation.isError ? m.error_generic() : null}
				success={mutation.isSuccess ? m.sent() : null}
			/>
		</Form>
	);
}
