import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

const STALE_TIME_MS = 30_000;
export function QueryProvider({ children }: { children: ReactNode }) {
	const [client] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { staleTime: STALE_TIME_MS, retry: 1 },
					mutations: { retry: false },
				},
			}),
	);
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
