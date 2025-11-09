import { z } from "zod";

// Availability schema
export const availability = z.object({
	id: z.number().int(),
	user_id: z.number().int(),
	weekday: z.number().int().min(0).max(6), // 0=Sunday, 6=Saturday
	time_slot: z.string(), // e.g., "09:00-11:00"
	created_at: z.string().datetime(),
});

export const AvailabilityModel = {
	tableName: "availability",
	primaryKeys: ["id"],
	schema: availability,
	serializer: (obj: object) => {
		return {
			...obj,
		};
	},
	serializerObject: availability,
};
