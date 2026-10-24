import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<section className="mx-auto w-[calc(100%_-_2rem)] max-w-[76rem] md:w-[calc(100%_-_4rem)] grid min-h-[72vh] place-items-center py-24 text-center">
			<div className="max-w-3xl">
				<h1 className="font-serif font-bold leading-[0.96] tracking-[-0.045em] text-5xl md:text-7xl">
					{m.page_error_title()}
				</h1>
				<p className="mx-auto mt-6 max-w-lg text-lg text-ink/65">
					{m.page_error_description()}
				</p>
				<Button
					className="inline-flex min-h-12 items-center justify-center gap-[0.55rem] rounded-full border border-transparent bg-forest px-[1.15rem] py-3 text-[0.9rem] font-[720] leading-none text-cream transition hover:-translate-y-0.5 hover:bg-[#172f20] mt-8"
					disabled={pending}
					onClick={() => void router.invalidate()}
				>
					{pending ? m.loading() : m.retry()}
				</Button>
			</div>
		</section>
	);
}
