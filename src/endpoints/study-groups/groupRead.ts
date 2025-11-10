import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint, StudyGroupWithMembersSchema } from "./base";

/**
 * Read Study Group Endpoint
 * 
 * Get detailed information about a specific study group
 */
export class GroupRead extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Get study group details",
		description: "Retrieve detailed information about a specific study group, including its members. Private groups are only accessible to members.",
		request: {
			params: z.object({
				id: z.string()
					.transform(Number)
					.describe("Study group ID"),
			}),
		},
		responses: {
			"200": {
				description: "Successfully retrieved study group",
				...contentJson({
					success: z.boolean(),
					result: StudyGroupWithMembersSchema,
				}),
			},
			"404": {
				description: "Study group not found",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
			"403": {
				description: "Access denied to private group",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id } = data.params;

		try {
			// Get group information
			const group = await this.getGroupById(c, id);

			if (!group) {
				return c.json({
					success: false,
					error: "Study group not found",
				}, 404);
			}

			// Get member count
			const memberCountResult = await c.env.DB
				.prepare(`
					SELECT COUNT(*) as count 
					FROM group_members 
					WHERE group_id = ? AND status = 'active'
				`)
				.bind(id)
				.first();

			// Get all members with user details
			const membersResult = await c.env.DB
				.prepare(`
					SELECT 
						gm.user_id,
						gm.role,
						gm.status,
						gm.joined_at,
						u.username,
						u.email
					FROM group_members gm
					JOIN users u ON gm.user_id = u.id
					WHERE gm.group_id = ?
					ORDER BY 
						CASE gm.role 
							WHEN 'admin' THEN 0 
							ELSE 1 
						END,
						gm.joined_at ASC
				`)
				.bind(id)
				.all();

			return {
				success: true,
				result: {
					...group,
					is_private: group.is_private === 1,
					member_count: memberCountResult?.count || 0,
					members: membersResult.results || [],
				},
			};
		} catch (error) {
			console.error("Error reading study group:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to read study group",
			}, 500);
		}
	}
}
