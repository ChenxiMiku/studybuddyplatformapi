import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { verifyToken } from "../../utils/jwt";

export class UserCurrentProfile extends OpenAPIRoute {
	public schema = {
		tags: ["Users"],
		summary: "Get current user's complete profile",
		description: "Get authenticated user's information with all related courses, skills, and availability",
		security: [{
			BearerAuth: []
		}],
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
							bio: z.string().nullable(),
							avatar_url: z.string().nullable(),
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
					groups: z.array(z.object({
						id: z.number(),
						group_id: z.number(),
						group_name: z.string(),
						group_description: z.string().nullable(),
						role: z.string(),
						status: z.string(),
						joined_at: z.string(),
					})),
					stats: z.object({
						groups_count: z.number(),
						messages_count: z.number(),
						average_rating: z.number().nullable(),
					}),
					}),
				}),
			},
			"401": {
				description: "Unauthorized - Invalid or missing token",
			},
		},
	};

	public async handle(c: AppContext) {
		try {
			// Verify authentication
			const authHeader = c.req.header("Authorization");
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return c.json(
					{
						success: false,
						errors: [{ code: 4011, message: "Missing or invalid authorization header" }],
					},
					401
				);
			}

			const token = authHeader.substring(7);
			const payload = await verifyToken(token, c.env.JWT_SECRET, "access");
			
			if (!payload) {
				return c.json(
					{
						success: false,
						errors: [{ code: 4012, message: "Invalid or expired token" }],
					},
					401
				);
			}

			const userId = payload.userId;
			console.log("Loading profile for user:", userId);

		// Get user basic info
		const user = await c.env.DB.prepare(
			`SELECT id, username, email, bio, avatar_url, goals, study_preference, created_at, updated_at 
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

		// Get user's study groups
		const groupsResult = await c.env.DB.prepare(
			`SELECT gm.id, gm.group_id, sg.name as group_name, sg.description as group_description, 
			        gm.role, gm.status, gm.joined_at
			 FROM group_members gm
			 JOIN study_groups sg ON gm.group_id = sg.id
			 WHERE gm.user_id = ?
			 ORDER BY gm.joined_at DESC`
		)
			.bind(userId)
			.all();

		// Get user statistics
		const groupsCount = await c.env.DB.prepare(
			`SELECT COUNT(*) as count FROM group_members WHERE user_id = ?`
		)
			.bind(userId)
			.first();

		const messagesCount = await c.env.DB.prepare(
			`SELECT COUNT(*) as count FROM messages WHERE sender_id = ?`
		)
			.bind(userId)
			.first();

		return {
			success: true,
			result: {
				user,
				courses: coursesResult.results || [],
				skills: skillsResult.results || [],
				availability: availabilityResult.results || [],
				groups: groupsResult.results || [],
				stats: {
					groups_count: groupsCount?.count || 0,
					messages_count: messagesCount?.count || 0,
					average_rating: null, // TODO: Implement rating system
				},
			},
		};
		} catch (error) {
			console.error("Error loading user profile:", error);
			return c.json(
				{
					success: false,
					errors: [{ code: 5001, message: "Internal server error" }],
				},
				500
			);
		}
	}
}
