import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { profilePasswordSchema } from "../../model/profile";
import { changeProfilePassword } from "../../server/profile.functions";
import { InputField } from "../input-field";

export function ProfilePasswordForm() {
	const router = useRouter();
	const changePassword = useServerFn(changeProfilePassword);
	const password = useMutation({
		mutationFn: changePassword,
		onSuccess: () => router.invalidate(),
	});
	const [validation, setValidation] = useState("");
	function submitPassword(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (password.isPending) return;
		const result = profilePasswordSchema.safeParse(
			Object.fromEntries(new FormData(event.currentTarget)),
		);
		if (!result.success) {
			setValidation(m.studio_password_mismatch());
			return;
		}
		setValidation("");
		password.mutate({ data: result.data });
	}
	return (
		<section className="settings-panel">
			<header>
				<KeyRound size={19} />
				<div>
					<h2>{m.password()}</h2>
					<p>{m.studio_password_help()}</p>
				</div>
			</header>
			<Form
				className="grid gap-4"
				onSubmit={submitPassword}
				onChange={() => {
					setValidation("");
					if (password.isSuccess || password.isError) password.reset();
				}}
			>
				<InputField
					disabled={password.isPending}
					name="password"
					type="password"
					autoComplete="new-password"
					label={m.studio_new_password()}
					required
				/>
				<InputField
					disabled={password.isPending}
					name="confirmation"
					type="password"
					autoComplete="new-password"
					label={m.studio_password_confirmation()}
					required
				/>
				<div className="settings-actions">
					<Button
						className="button"
						type="submit"
						disabled={password.isPending}
					>
						{m.studio_change_password()}
					</Button>
				</div>
				<FormFeedback
					error={validation || (password.isError ? m.error_generic() : null)}
				/>
			</Form>
		</section>
	);
}
