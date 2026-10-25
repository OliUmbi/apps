import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { loginToStudio } from "../server/session.functions";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";
import { GradientPanel } from "./ui/gradient-panel";
import { Split } from "./ui/split";
import { Title } from "./ui/text";
import { TextField } from "./ui/text-field";

export function LoginView() {
	const router = useRouter();
	const login = useServerFn(loginToStudio);
	const mutation = useMutation({
		mutationFn: login,
		onSuccess: () => router.invalidate(),
	});
	return (
		<Split
			scenery={
				<GradientPanel preset="tide">
					<Title size="sm">{m.studio_brand()}</Title>
				</GradientPanel>
			}
		>
			<Form
				className="flex w-full max-w-sm flex-col justify-between gap-8 px-4 py-8"
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
				<div className="flex flex-col gap-6">
					<TextField
						name="username"
						label={m.username()}
						autoComplete="username"
						required
					/>
					<TextField
						name="password"
						label={m.password()}
						type="password"
						autoComplete="current-password"
						required
					/>
				</div>
				<div className="flex flex-col gap-4">
					<Button variant="primary" type="submit" disabled={mutation.isPending}>
						{mutation.isPending ? m.loading() : m.studio_login()}
					</Button>
					<Alert tone="error">
						{mutation.isError ? m.error_generic() : null}
					</Alert>
				</div>
			</Form>
		</Split>
	);
}
