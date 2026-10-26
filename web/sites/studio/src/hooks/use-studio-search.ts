import { createContext, useContext } from "react";
import type { StudioSearch } from "../model/navigation";

// The route owns the URL state and hands it down through this context; no
// component or hook may import the route itself (that module cycle pulled
// every collection into the dashboard's composition root).
export interface StudioSearchState {
	search: StudioSearch;
	navigate: (search: StudioSearch) => void;
}

export const StudioSearchContext = createContext<StudioSearchState | null>(
	null,
);

export function useStudioSearch(): StudioSearchState {
	const state = useContext(StudioSearchContext);
	if (!state) throw new Error("StudioSearchContext is missing its provider");
	return state;
}
