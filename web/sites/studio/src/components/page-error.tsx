import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<main className="login-page">
			<div className="relative w-[min(100%,390px)] rounded-xl border border-border bg-[rgb(21_21_24/92%)] shadow-[0_30px_90px_rgb(0_0_0/45%),inset_0_1px_rgb(255_255_255/4%)]">
				<div className="flex items-center gap-2.5 border-b border-border-soft px-5 py-[17px] text-sm font-semibold">
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
