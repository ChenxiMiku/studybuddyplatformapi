import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";

export class UserProfile extends OpenAPIRoute {
	public schema = {
		tags: ["Users"],
		summary: "Get user complete profile",
		description: "Get user information with all related courses, skills, and availability",
		request: {
			params: z.object({
				id: z.string().transform(Number).describe("User ID"),
			}),
		},
		responses: {
			"200": {
				description: "User profile retrieved successfully",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						user: z.object({
							id: z.number(),
							username: z.string(),
							email: z.string(),
							goals: z.string().nullable(),
							study_preference: z.string().nullable(),
							created_at: z.string(),
							updated_at: z.string(),
						}),
						courses: z.array(z.object({
							id: z.number(),
							course_name: z.string(),
							created_at: z.string(),
						})),
						skills: z.array(z.object({
							id: z.number(),
							skill_id: z.number(),
							skill_name: z.string(),
							proficiency_level: z.string().nullable(),
							created_at: z.string(),
						})),
						availability: z.array(z.object({
							id: z.number(),
							weekday: z.number(),
							time_slot: z.string(),
							created_at: z.string(),
						})),
					}),
				}),
			},
			"404": {
				description: "User not found",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const userId = data.params.id;

		// Get user basic info
		const user = await c.env.DB.prepare(
			`SELECT id, username, email, goals, study_preference, created_at, updated_at 
			 FROM users WHERE id = ?`
		)
			.bind(userId)
			.first();

		if (!user) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4042, message: "User not found" }],
				},
				404
			);
		}

		// Get user courses
		const coursesResult = await c.env.DB.prepare(
			`SELECT id, course_name, created_at 
			 FROM courses WHERE user_id = ? ORDER BY created_at DESC`
		)
			.bind(userId)
			.all();

		// Get user skills with skill names
		const skillsResult = await c.env.DB.prepare(
			`SELECT us.id, us.skill_id, s.skill_name, us.proficiency_level, us.created_at
			 FROM user_skills us
			 JOIN skills s ON us.skill_id = s.id
			 WHERE us.user_id = ?
			 ORDER BY us.created_at DESC`
		)
			.bind(userId)
			.all();

		// Get user availability
		const availabilityResult = await c.env.DB.prepare(
			`SELECT id, weekday, time_slot, created_at 
			 FROM availability WHERE user_id = ? 
			 ORDER BY weekday ASC, time_slot ASC`
		)
			.bind(userId)
			.all();

		return {
			success: true,
			result: {
				user,
				courses: coursesResult.results || [],
				skills: skillsResult.results || [],
				availability: availabilityResult.results || [],
			},
		};
	}
}
