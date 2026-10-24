import { Button } from "@base-ui/react/button";
import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<section className="mx-auto w-[min(100%_-_2rem,1240px)] status-page">
			<div>
				<h1>{m.page_error_title()}</h1>
				<p className="mb-8 max-w-[560px] text-[1.05rem] leading-[1.7] text-[#68645f]">
					{m.page_error_description()}
				</p>
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
