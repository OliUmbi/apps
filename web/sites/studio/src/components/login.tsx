import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { loginToStudio } from "../server/session.functions";
import { Button, Form, FormFeedback, InputField } from "./ui/index";

export function Login() {
	const router = useRouter();
	const login = useServerFn(loginToStudio);
	const mutation = useMutation({
		mutationFn: login,
		onSuccess: () => router.invalidate(),
	});
	return (
		<div className="login-page">
			<section className="login-panel">
				<div className="login-brand">
					<span className="brand-mark large">
						{m.studio_components_login_text()}
					</span>
					{m.studio_components_login_text_2()}
				</div>
				<div className="login-copy">
					<p className="page-kicker">{m.studio_components_login_paragraph()}</p>
					<h1>{m.studio_components_login_heading()}</h1>
					<p>{m.studio_components_login_paragraph_2()}</p>
				</div>
				<Form
					className="grid gap-5 px-7 pt-6 pb-7"
					onSubmit={(event) => {
						event.preventDefault();
						const form = new FormData(event.currentTarget);
						mutation.mutate({
							data: {
								username: String(form.get("username")),
								password: String(form.get("password")),
							},
						});
					}}
				>
					<InputField
						name="username"
						label={m.studio_components_login_label()}
						autoComplete="username"
						required
					/>
					<InputField
						name="password"
						label={m.studio_components_login_label_2()}
						type="password"
						autoComplete="current-password"
						required
					/>
					<FormFeedback error={mutation.isError ? m.error_generic() : null} />
					<Button
						className="button primary"
						type="submit"
						disabled={mutation.isPending}
					>
						{mutation.isPending ? m.loading() : m.studio_login()}
					</Button>
				</Form>
			</section>
		</div>
	);
}
