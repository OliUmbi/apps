import { Button } from "@base-ui/react/button";
import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { FormFeedback } from "@oliumbi/ui/form-feedback";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { loginToStudio } from "../server/session.functions";
import { InputField } from "./input-field";

export function LoginView() {
	const router = useRouter();
	const login = useServerFn(loginToStudio);
	const mutation = useMutation({
		mutationFn: login,
		onSuccess: () => router.invalidate(),
	});
	return (
		<main className="login-page">
			<section className="login-panel">
				<div className="login-brand">
					<span className="brand-mark large">O</span>
					{m.studio_brand()}
				</div>
				<div className="login-body">
					<p className="page-kicker">{m.studio_login_eyebrow()}</p>
					<h1>{m.studio_login_title()}</h1>
					<p>{m.studio_login_description()}</p>
				</div>
				<Form
					className="grid gap-5 px-7 pt-6 pb-7"
					onSubmit={(event) => {
						event.preventDefault();
						if (mutation.isPending) return;
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
						label={m.username()}
						autoComplete="username"
						required
					/>
					<InputField
						name="password"
						label={m.password()}
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
		</main>
	);
}
