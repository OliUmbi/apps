import { paraglideMiddleware } from "@oliumbi/i18n/server";
import handler from "@tanstack/react-start/server-entry";
export default {
	fetch(request: Request) {
		return paraglideMiddleware(request, () => handler.fetch(request));
	},
};
