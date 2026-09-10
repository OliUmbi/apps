import type { Database } from "@oliumbi/database";
import { createResourceRepository as clubRepository } from "@oliumbi/jublawoma-data";
import { resourceIds as clubIds } from "@oliumbi/jublawoma-data/contracts";
import { createResourceRepository as cateringRepository } from "@oliumbi/unclet-data";
import { resourceIds as cateringIds } from "@oliumbi/unclet-data/contracts";
import { createResourceRepository as farmRepository } from "@oliumbi/zelglihof-data";
import { resourceIds as farmIds } from "@oliumbi/zelglihof-data/contracts";
import type { ResourceId } from "../studio/resources";

export function siteRepository(sql: Database, id: ResourceId) {
	const club = clubIds.find((candidate) => candidate === id);
	if (club) return clubRepository(sql, club);
	const catering = cateringIds.find((candidate) => candidate === id);
	if (catering) return cateringRepository(sql, catering);
	const farm = farmIds.find((candidate) => candidate === id);
	if (farm) return farmRepository(sql, farm);
	throw new Error("Unknown site resource");
}
