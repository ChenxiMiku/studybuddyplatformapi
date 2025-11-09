import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";

export class UserMatchSearch extends OpenAPIRoute {
	public schema = {
		tags: ["Search"],
		summary: "Search for matching study buddies",
		description: "Find users with matching courses, skills, or availability",
		request: {
			query: z.object({
				user_id: z.string().transform(Number).optional().describe("Current user ID (to exclude from results)"),
				course: z.string().optional().describe("Search by course name"),
				skill_id: z.string().transform(Number).optional().describe("Search by skill ID"),
				weekday: z.string().transform(Number).optional().describe("Search by available weekday (0-6)"),
				time_slot: z.string().optional().describe("Search by time slot"),
				study_preference: z.enum(["group", "one-on-one", "both"]).optional().describe("Study preference"),
				limit: z.string().transform(Number).default("20").describe("Maximum results"),
			}),
		},
		responses: {
			"200": {
				description: "Matching users found",
				...contentJson({
					success: z.boolean(),
					result: z.array(z.object({
						id: z.number(),
						username: z.string(),
						email: z.string(),
						goals: z.string().nullable(),
						study_preference: z.string().nullable(),
						match_reason: z.string().describe("Why this user matches"),
						created_at: z.string(),
					})),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { user_id, course, skill_id, weekday, time_slot, study_preference, limit } = data.query;

		let query = `SELECT DISTINCT u.id, u.username, u.email, u.goals, u.study_preference, u.created_at`;
		let matchReason = "";
		const bindings: any[] = [];

		if (course) {
			// Match by course
			query += `, 'Same course: ' || c.course_name as match_reason
				FROM users u
				JOIN courses c ON u.id = c.user_id
				WHERE c.course_name LIKE ?`;
			bindings.push(`%${course}%`);
			matchReason = "course";
		} else if (skill_id) {
			// Match by skill
			query += `, 'Same skill' as match_reason
				FROM users u
				JOIN user_skills us ON u.id = us.user_id
				WHERE us.skill_id = ?`;
			bindings.push(skill_id);
			matchReason = "skill";
		} else if (weekday !== undefined && time_slot) {
			// Match by availability
			query += `, 'Available at same time' as match_reason
				FROM users u
				JOIN availability a ON u.id = a.user_id
				WHERE a.weekday = ? AND a.time_slot = ?`;
			bindings.push(weekday, time_slot);
			matchReason = "availability";
		} else if (weekday !== undefined) {
			// Match by weekday only
			query += `, 'Available on same day' as match_reason
				FROM users u
				JOIN availability a ON u.id = a.user_id
				WHERE a.weekday = ?`;
			bindings.push(weekday);
			matchReason = "weekday";
		} else {
			// No specific filter, return all users
			query += `, 'Active user' as match_reason
				FROM users u
				WHERE 1=1`;
		}

		// Exclude current user
		if (user_id) {
			query += ` AND u.id != ?`;
			bindings.push(user_id);
		}

		// Filter by study preference
		if (study_preference) {
			query += ` AND (u.study_preference = ? OR u.study_preference = 'both')`;
			bindings.push(study_preference);
		}

		query += ` ORDER BY u.created_at DESC LIMIT ?`;
		bindings.push(limit);

		const result = await c.env.DB.prepare(query)
			.bind(...bindings)
			.all();

		return {
			success: true,
			result: result.results || [],
		};
	}
}
