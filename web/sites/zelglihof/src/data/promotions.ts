import { createPublicRepository } from "@oliumbi/zelglihof-data";
import { createServerFn } from "@tanstack/react-start";
import { database } from "../server/database.server";

export const getPromotions = createServerFn({ method: "GET" }).handler(() =>
	createPublicRepository(database.db).listPromotions(0),
);
