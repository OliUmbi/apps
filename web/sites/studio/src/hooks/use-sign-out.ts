import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { logoutFromStudio } from "../server/session.functions";

export function useSignOut() {
	const router = useRouter();
	const logout = useServerFn(logoutFromStudio);
	return useMutation({
		mutationFn: logout,
		onSettled: () => router.invalidate(),
	});
}
