import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<section className="shell grid min-h-[72vh] place-items-center py-24 text-center">
			<div className="max-w-3xl">
				<h1 className="display-title text-5xl md:text-7xl">
					{m.page_error_title()}
				</h1>
				<p className="mx-auto mt-6 max-w-lg text-lg text-ink/65">
					{m.page_error_description()}
				</p>
				<Button
					className="button-primary mt-8"
					disabled={pending}
					onClick={() => void router.invalidate()}
				>
					{pending ? m.loading() : m.retry()}
				</Button>
			</div>
		</section>
	);
}
