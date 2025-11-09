import { z } from "zod";

// User_skill schema
export const userSkill = z.object({
	id: z.number().int(),
	user_id: z.number().int(),
	skill_id: z.number().int(),
	proficiency_level: z.enum(["beginner", "intermediate", "advanced"]).optional().nullable(),
	created_at: z.string().datetime(),
});

export const UserSkillModel = {
	tableName: "user_skills",
	primaryKeys: ["id"],
	schema: userSkill,
	serializer: (obj: object) => {
		return {
			...obj,
		};
	},
	serializerObject: userSkill,
};
