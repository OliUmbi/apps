import { Form } from "@base-ui/react/form";
import { emailSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requestSubscriberConfirmation } from "../server/newsletter.functions";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { Body } from "./ui/text";
import { TextField } from "./ui/text-field";

export function SubscriberInvite() {
	const request = useServerFn(requestSubscriberConfirmation);
	const cache = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (form: FormData) =>
			request({ data: { email: emailSchema.parse(form.get("email")) } }),
		onSuccess: () =>
			cache.invalidateQueries({
				queryKey: ["content", "zelglihof.subscriber"],
			}),
	});
	return (
		<Form
			className="overflow-hidden rounded-md border border-line-subtle bg-layer-1 grid gap-4 p-6"
			onChange={() => {
				if (mutation.isSuccess || mutation.isError) mutation.reset();
			}}
			onSubmit={(event) => {
				event.preventDefault();
				if (mutation.isPending) return;
				mutation.mutate(new FormData(event.currentTarget));
			}}
		>
			<TextField
				disabled={mutation.isPending}
				name="email"
				type="email"
				label={m.email()}
				required
			/>
			<Body>{m.studio_subscriber_invite_help()}</Body>
			<Button type="submit" variant="primary" disabled={mutation.isPending}>
				{m.studio_subscriber_invite()}
			</Button>
			<Alert tone={mutation.isError ? "error" : "success"}>
				{mutation.isError
					? m.error_generic()
					: mutation.isSuccess
						? m.sent()
						: null}
			</Alert>
		</Form>
	);
}
