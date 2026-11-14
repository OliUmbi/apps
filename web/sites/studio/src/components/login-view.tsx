import { Form } from "@base-ui/react/form";
import { m } from "@oliumbi/i18n/messages";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Alert } from "./ui/alert";
import { Brand } from "./ui/brand";
import { Button } from "./ui/button";
import { GradientPanel } from "./ui/gradient-panel";
import { Split } from "./ui/split";
import { Title } from "./ui/text";
import { TextField } from "./ui/text-field";

export function LoginView() {
	const router = useRouter();
	const mutation = useMutation({
		mutationFn: async (credentials: { username: string; password: string }) => {
			const response = await fetch("/api/session/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(credentials),
			});
			if (!response.ok) throw new Error("Login failed");
			return response.json();
		},
		onSuccess: () => router.invalidate(),
	});
	return (
		<Split
			scenery={
				<GradientPanel preset="tide">
					<p className="relative z-10 text-5xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
						Studio.
					</p>
				</GradientPanel>
			}
		>
			<div className="flex w-full max-w-md flex-col gap-10 px-6 py-10 md:px-12">
				<Brand name={m.studio_brand()} />
				<Title as="h1" size="lg">
					{m.studio_login_title()}
				</Title>
				<Form
					className="flex w-full flex-col gap-7"
					onSubmit={(event) => {
						event.preventDefault();
						if (mutation.isPending) return;
						const form = new FormData(event.currentTarget);
						mutation.mutate({
							username: String(form.get("username")),
							password: String(form.get("password")),
						});
					}}
				>
					<div className="flex flex-col gap-5">
						<TextField
							name="username"
							label={m.username()}
							autoComplete="username"
							required
							autoFocus
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
						<Button
							variant="primary"
							type="submit"
							disabled={mutation.isPending}
						>
							{mutation.isPending ? m.loading() : m.studio_login()}
						</Button>
						<Alert tone="error">
							{mutation.isError ? m.error_generic() : null}
						</Alert>
					</div>
				</Form>
			</div>
		</Split>
	);
}
