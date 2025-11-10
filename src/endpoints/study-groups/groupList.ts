import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint, StudyGroupWithMembersSchema } from "./base";

/**
 * List Study Groups Endpoint
 * 
 * Retrieve a list of study groups with optional filtering and pagination
 */
export class GroupList extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "List study groups",
		description: "Retrieve a list of study groups. Public groups are visible to all users. Private groups are only visible to members.",
		request: {
			query: z.object({
				search: z.string()
					.optional()
					.describe("Search term to filter groups by name or description"),
				is_private: z.string()
					.transform(val => val === "true")
					.optional()
					.describe("Filter by privacy setting (true/false)"),
				user_id: z.string()
					.transform(Number)
					.optional()
					.describe("Filter groups where this user is a member"),
				limit: z.string()
					.transform(Number)
					.default("20")
					.describe("Maximum number of results to return"),
				offset: z.string()
					.transform(Number)
					.default("0")
					.describe("Number of results to skip for pagination"),
			}),
		},
		responses: {
			"200": {
				description: "Successfully retrieved study groups",
				...contentJson({
					success: z.boolean(),
					result: z.array(StudyGroupWithMembersSchema),
					total: z.number(),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { search, is_private, user_id, limit, offset } = data.query;

		try {
			let query = `
				SELECT 
					sg.*,
					COUNT(DISTINCT gm.id) as member_count
				FROM study_groups sg
				LEFT JOIN group_members gm ON sg.id = gm.group_id AND gm.status = 'active'
				WHERE 1=1
			`;
			const params: any[] = [];

			// Filter by privacy
			if (is_private !== undefined) {
				query += ` AND sg.is_private = ?`;
				params.push(is_private ? 1 : 0);
			}

			// Filter by search term
			if (search) {
				query += ` AND (sg.name LIKE ? OR sg.description LIKE ?)`;
				params.push(`%${search}%`, `%${search}%`);
			}

			// Filter by user membership
			if (user_id) {
				query += ` AND sg.id IN (
					SELECT group_id FROM group_members 
					WHERE user_id = ? AND status = 'active'
				)`;
				params.push(user_id);
			}

			query += ` GROUP BY sg.id ORDER BY sg.created_at DESC LIMIT ? OFFSET ?`;
			params.push(limit, offset);

			const result = await c.env.DB
				.prepare(query)
				.bind(...params)
				.all();

			// Get total count
			let countQuery = `SELECT COUNT(DISTINCT sg.id) as total FROM study_groups sg WHERE 1=1`;
			const countParams: any[] = [];

			if (is_private !== undefined) {
				countQuery += ` AND sg.is_private = ?`;
				countParams.push(is_private ? 1 : 0);
			}

			if (search) {
				countQuery += ` AND (sg.name LIKE ? OR sg.description LIKE ?)`;
				countParams.push(`%${search}%`, `%${search}%`);
			}

			if (user_id) {
				countQuery += ` AND sg.id IN (
					SELECT group_id FROM group_members 
					WHERE user_id = ? AND status = 'active'
				)`;
				countParams.push(user_id);
			}

			const countResult = await c.env.DB
				.prepare(countQuery)
				.bind(...countParams)
				.first();

			const groups = (result.results || []).map((group: any) => ({
				...group,
				is_private: group.is_private === 1,
				member_count: group.member_count || 0,
			}));

			return {
				success: true,
				result: groups,
				total: countResult?.total || 0,
			};
		} catch (error) {
			console.error("Error listing study groups:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to list study groups",
			}, 500);
		}
	}
}
