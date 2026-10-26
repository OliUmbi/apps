import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound } from "lucide-react";
import { passwordSchema } from "../../model/accounts";
import { changePassword } from "../../server/accounts.functions";
import { InputField } from "../input-field";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Panel } from "../ui/panel";

export function AccountPasswordForm({ accountId }: { accountId: string }) {
	const changeAccountPassword = useServerFn(changePassword);
	const resetPassword = useMutation({
		mutationFn: async (form: FormData) =>
			changeAccountPassword({
				data: {
					id: accountId,
					password: passwordSchema.parse(form.get("password")),
				},
			}),
	});
	return (
		<Panel
			className="col-span-full max-md:col-auto"
			title={m.studio_password_reset()}
			description={m.studio_password_reset_help()}
			icon={KeyRound}
		>
			<Form
				className="flex items-end gap-3 max-md:flex-col"
				onChange={() => {
					if (resetPassword.isSuccess || resetPassword.isError)
						resetPassword.reset();
				}}
				onSubmit={(event) => {
					event.preventDefault();
					if (resetPassword.isPending) return;
					const form = event.currentTarget;
					resetPassword.mutate(new FormData(event.currentTarget), {
						onSuccess: () => form.reset(),
					});
				}}
			>
				<div className="grow">
					<InputField
						disabled={resetPassword.isPending}
						name="password"
						type="password"
						autoComplete="new-password"
						label={m.studio_new_password()}
						required
					/>
				</div>
				<Button
					type="submit"
					variant="secondary"
					disabled={resetPassword.isPending}
				>
					{m.studio_change_password()}
				</Button>
			</Form>
			<Alert tone={resetPassword.isError ? "error" : "success"}>
				{resetPassword.isError
					? m.error_generic()
					: resetPassword.isSuccess
						? m.studio_password_saved()
						: null}
			</Alert>
		</Panel>
	);
}
