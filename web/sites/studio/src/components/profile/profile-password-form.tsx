import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { profilePasswordSchema } from "../../model/profile";
import { changeProfilePassword } from "../../server/profile.functions";
import { InputField } from "../input-field";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { FormFooter } from "../ui/form-footer";
import { Panel } from "../ui/panel";

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
		<Panel
			title={m.password()}
			description={m.studio_password_help()}
			icon={KeyRound}
		>
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
				<FormFooter>
					<Button
						variant="secondary"
						type="submit"
						disabled={password.isPending}
					>
						{m.studio_change_password()}
					</Button>
				</FormFooter>
				<Alert>
					{validation || (password.isError ? m.error_generic() : null)}
				</Alert>
			</Form>
		</Panel>
	);
}
