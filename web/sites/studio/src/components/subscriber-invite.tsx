import { Form } from "@base-ui/react/form";
import { emailSchema } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { requestSubscriberConfirmation } from "../server/newsletter.functions";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { FormFooter } from "./ui/form-footer";
import { Panel } from "./ui/panel";
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
		<Panel
			title={m.studio_subscriber_invite()}
			description={m.studio_subscriber_invite_help()}
		>
			<Form
				className="grid gap-5"
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
				<Alert tone={mutation.isError ? "error" : "success"}>
					{mutation.isError
						? m.error_generic()
						: mutation.isSuccess
							? m.sent()
							: null}
				</Alert>
				<FormFooter>
					<Button type="submit" variant="primary" disabled={mutation.isPending}>
						{mutation.isPending ? m.loading() : m.studio_subscriber_invite()}
					</Button>
				</FormFooter>
			</Form>
		</Panel>
	);
}
