import { Button } from "@base-ui/react/button";
import type { Page } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function PaginatedList<T>({
	queryKey,
	initialPage,
	load,
	children,
}: {
	queryKey: readonly string[];
	initialPage: Page<T>;
	load: (page: number) => Promise<Page<T>>;
	children: (items: T[]) => ReactNode;
}) {
	const query = useInfiniteQuery({
		queryKey,
		initialPageParam: 0,
		initialData: { pages: [initialPage], pageParams: [0] },
		queryFn: ({ pageParam }) => load(pageParam),
		getNextPageParam: (page) => page.nextPage,
	});
	return (
		<>
			{children(query.data.pages.flatMap((page) => page.items))}
			{query.data.pages[0].items.length === 0 && !query.isError && (
				<p className="shell py-8">{m.empty()}</p>
			)}
			{query.isError && (
				<p className="shell py-4" role="alert">
					{m.error_generic()}
				</p>
			)}
			{query.hasNextPage && (
				<div className="shell pb-12">
					<Button
						className="rounded-full border border-current/30 px-6 py-3 font-medium disabled:opacity-50"
						disabled={query.isFetchingNextPage}
						onClick={() => {
							void query.fetchNextPage();
						}}
					>
						{query.isFetchingNextPage ? m.loading() : m.load_more()}
					</Button>
				</div>
			)}
		</>
	);
}
