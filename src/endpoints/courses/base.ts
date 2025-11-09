import { z } from "zod";

// Course schema
export const course = z.object({
	id: z.number().int(),
	user_id: z.number().int(),
	course_name: z.string().min(1).max(200),
	created_at: z.string().datetime(),
});

export const CourseModel = {
	tableName: "courses",
	primaryKeys: ["id"],
	schema: course,
	serializer: (obj: object) => {
		return {
			...obj,
		};
	},
	serializerObject: course,
};
