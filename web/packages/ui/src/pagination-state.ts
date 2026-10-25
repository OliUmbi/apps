/*
 * Pagination state for PaginatedList. The route loader owns page 0: every
 * loader generation (a new `initialPage` object after `router.invalidate()` or
 * a revisit) gets its own cache entry, so a fresh page 0 resets the visible
 * chain instead of keeping stale pages beside freshly loaded data (J-16), while
 * equal generations keep their loaded pages across remounts. Loader pages cross
 * a server-function boundary and therefore arrive as stable JSON objects.
 */

const generations = new WeakMap<object, number>();
let nextGeneration = 1;

export function paginationQueryKey(
	queryKey: readonly string[],
	seed: object,
): readonly string[] {
	return [...queryKey, `loader-generation-${generationOf(seed)}`];
}

function generationOf(seed: object): number {
	const known = generations.get(seed);
	if (known !== undefined) return known;
	const generation = nextGeneration;
	nextGeneration += 1;
	generations.set(seed, generation);
	return generation;
}

// Class composition for the wrappers PaginatedList renders itself. The default
// container is plain: no implicit class names a site would have to define.
export function paginationClasses(
	containerClassName: string,
	...extra: string[]
): string {
	return [containerClassName, ...extra]
		.filter((part) => part.length > 0)
		.join(" ");
}
