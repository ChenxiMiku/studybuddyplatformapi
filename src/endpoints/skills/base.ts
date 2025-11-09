import { z } from "zod";

// Skill schema
export const skill = z.object({
	id: z.number().int(),
	skill_name: z.string().min(1).max(100),
	created_at: z.string().datetime(),
});

export const SkillModel = {
	tableName: "skills",
	primaryKeys: ["id"],
	schema: skill,
	serializer: (obj: object) => {
		return {
			...obj,
		};
	},
	serializerObject: skill,
};
