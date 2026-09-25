import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<section className="shell status-page">
			<div>
				<h1>{m.page_error_title()}</h1>
				<p className="status-page-description">{m.page_error_description()}</p>
				<Button
					className="button dark"
					disabled={pending}
					onClick={() => void router.invalidate()}
				>
					{pending ? m.loading() : m.retry()}
				</Button>
			</div>
			<img src="/assets/images/doodles/strolling.svg" alt="" />
		</section>
	);
}
