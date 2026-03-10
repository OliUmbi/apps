import { initTRPC } from "@trpc/server";
import superjson from "superjson";

const trpcRootObject = initTRPC.create({
	transformer: superjson,
});

export const createTRPCRouter = trpcRootObject.router;

export const publicProcedure = trpcRootObject.procedure;
