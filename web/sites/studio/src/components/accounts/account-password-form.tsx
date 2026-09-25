import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound } from "lucide-react";
import { passwordSchema } from "../../model/accounts";
import { changePassword } from "../../server/accounts.functions";
import { InputField } from "../input-field";

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
		<section className="settings-panel settings-panel-wide">
			<header>
				<KeyRound size={19} />
				<div>
					<h2>{m.studio_password_reset()}</h2>
					<p>{m.studio_password_reset_help()}</p>
				</div>
			</header>
			<Form
				className="password-reset-form"
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
				<InputField
					disabled={resetPassword.isPending}
					name="password"
					type="password"
					autoComplete="new-password"
					label={m.studio_new_password()}
					required
				/>
				<Button
					type="submit"
					className="button"
					disabled={resetPassword.isPending}
				>
					{m.studio_change_password()}
				</Button>
			</Form>
			<FormFeedback
				error={resetPassword.isError ? m.error_generic() : null}
				success={resetPassword.isSuccess ? m.studio_password_saved() : null}
			/>
		</section>
	);
}
