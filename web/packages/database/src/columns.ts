import { customType } from "drizzle-orm/pg-core";

/** Keep timestamps serializable and consistent at domain and site boundaries. */
export const isoTimestamp = customType<{ data: string; driverData: string }>({
	dataType: () => "timestamptz",
	fromDriver: (value) => new Date(value).toISOString(),
	toDriver: (value) => value,
});
