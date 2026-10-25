import { m } from "@oliumbi/i18n/messages";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Brand } from "./ui/brand";
import { Button } from "./ui/button";
import { MessageScreen } from "./ui/message-screen";
import { Body, Title } from "./ui/text";

export function PageError() {
	const router = useRouter();
	const pending = useRouterState({ select: (state) => state.isLoading });

	return (
		<MessageScreen brand={<Brand name={m.studio_brand()} />}>
			<Title as="h1">{m.page_error_title()}</Title>
			<Body>{m.page_error_description()}</Body>
			<div className="flex flex-wrap gap-3">
				<Button
					variant="primary"
					disabled={pending}
					onClick={() => void router.invalidate()}
				>
					{pending ? m.loading() : m.retry()}
				</Button>
				<Button variant="secondary" render={<a href="/" />}>
					{m.studio_back_to_studio()}
				</Button>
			</div>
		</MessageScreen>
	);
}
