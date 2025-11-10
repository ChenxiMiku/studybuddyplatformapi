import { z } from "zod";

// User schema
export const user = z.object({
	id: z.number().int(),
	username: z.string().min(3).max(50),
	email: z.string().email(),
	password_hash: z.string(),
	bio: z.string().max(500).optional().nullable(),
	avatar_url: z.string().url().optional().nullable(),
	goals: z.string().optional().nullable(),
	study_preference: z.enum(["group", "one-on-one", "both"]).optional().nullable(),
	created_at: z.string().datetime(),
	updated_at: z.string().datetime(),
});

export const UserModel = {
	tableName: "users",
	primaryKeys: ["id"],
	schema: user,
	serializer: (obj: object) => {
		return {
			...obj,
		};
	},
	serializerObject: user,
};
