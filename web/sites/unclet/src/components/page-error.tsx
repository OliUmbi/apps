import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[90rem] md:w-[calc(100%_-_5rem)] grid min-h-[78vh] place-items-center py-32 text-center">
			<div className="max-w-3xl">
				<h1 className="font-serif font-medium leading-[0.95] tracking-[-0.045em] text-5xl md:text-7xl">
					{m.page_error_title()}
				</h1>
				<p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-bone/65">
					{m.page_error_description()}
				</p>
				<Button
					className="inline-flex min-h-[3.25rem] items-center justify-center gap-[0.65rem] border border-transparent bg-brass px-[1.6rem] py-[0.9rem] text-[0.78rem] font-bold uppercase tracking-[0.11em] text-night transition-colors hover:bg-brass-light mt-10"
					disabled={pending}
					onClick={() => void router.invalidate()}
				>
					{pending ? m.loading() : m.retry()}
				</Button>
			</div>
		</section>
	);
}
