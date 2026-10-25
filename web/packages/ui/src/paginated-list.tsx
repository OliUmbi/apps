import { Button } from "@base-ui/react/button";
import type { Page } from "@oliumbi/contracts";
import { m } from "@oliumbi/i18n/messages";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { paginationClasses, paginationQueryKey } from "./pagination-state";

export function PaginatedList<T>({
	queryKey,
	initialPage,
	load,
	children,
	containerClassName = "",
	emptyState = (
		<p className={paginationClasses(containerClassName, "py-8")}>{m.empty()}</p>
	),
	footer,
	staleTime,
}: {
	queryKey: readonly string[];
	initialPage: Page<T>;
	load: (page: number) => Promise<Page<T>>;
	children: (items: T[]) => ReactNode;
	// Container for the empty state, error and load-more wrappers this component
	// renders itself; each site passes its own width/spacing class. Custom
	// `emptyState` and `footer` nodes own their markup completely.
	containerClassName?: string;
	emptyState?: ReactNode;
	footer?: (state: {
		loadMore: () => void;
		isFetchingNextPage: boolean;
	}) => ReactNode;
	// Freshness budget for the loaded chain; the loader remains the source of
	// truth for page 0 (see `pagination-state`).
	staleTime?: number;
}) {
	const query = useInfiniteQuery({
		queryKey: paginationQueryKey(queryKey, initialPage),
		initialPageParam: 0,
		initialData: { pages: [initialPage], pageParams: [0] },
		queryFn: ({ pageParam }) => load(pageParam),
		getNextPageParam: (page: Page<T>) => page.nextPage,
		staleTime,
	});
	return (
		<>
			{children(query.data.pages.flatMap((page) => page.items))}
			{query.data.pages.every((page) => page.items.length === 0) &&
				!query.isError &&
				emptyState}
			{query.isError && (
				<p
					className={paginationClasses(containerClassName, "py-4")}
					role="alert"
				>
					{m.error_generic()}
				</p>
			)}
			{query.hasNextPage &&
				(footer ? (
					footer({
						loadMore: () => {
							void query.fetchNextPage();
						},
						isFetchingNextPage: query.isFetchingNextPage,
					})
				) : (
					<div className={paginationClasses(containerClassName, "pb-12")}>
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
				))}
		</>
	);
}
