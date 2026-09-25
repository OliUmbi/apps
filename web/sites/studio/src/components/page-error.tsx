import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<main className="login-page">
			<div className="login-panel">
				<div className="login-brand">
					<span className="brand-mark large">O</span>
					{m.studio_brand()}
				</div>
				<div className="login-body">
					<h1>{m.page_error_title()}</h1>
					<p>{m.page_error_description()}</p>
					<div className="mt-6 flex flex-wrap gap-3">
						<Button
							className="button primary"
							disabled={pending}
							onClick={() => void router.invalidate()}
						>
							{pending ? m.loading() : m.retry()}
						</Button>
						<a href="/" className="button">
							{m.studio_back_to_studio()}
						</a>
					</div>
				</div>
			</div>
		</main>
	);
}
