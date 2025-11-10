import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint } from "./base";

/**
 * Leave Study Group Endpoint
 * 
 * Leave a study group as a member
 */
export class GroupLeave extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Leave a study group",
		description: "Leave a study group. If you are the last admin, you cannot leave unless you transfer admin rights or delete the group.",
		request: {
			params: z.object({
				id: z.string()
					.transform(Number)
					.describe("Study group ID"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							user_id: z.number()
								.int()
								.positive()
								.describe("ID of the user leaving the group"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Successfully left the group",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						message: z.string(),
					}),
				}),
			},
			"400": {
				description: "Cannot leave group (last admin)",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
			"404": {
				description: "Study group or membership not found",
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
		const { user_id } = data.body;

		try {
			// Check if user is a member
			const membership = await c.env.DB
				.prepare(`
					SELECT role, status FROM group_members 
					WHERE group_id = ? AND user_id = ?
				`)
				.bind(id, user_id)
				.first();

			if (!membership) {
				return c.json({
					success: false,
					error: "You are not a member of this group",
				}, 404);
			}

			// If user is an admin, check if they are the last admin
			if (membership.role === "admin") {
				const adminCount = await c.env.DB
					.prepare(`
						SELECT COUNT(*) as count FROM group_members 
						WHERE group_id = ? AND role = 'admin' AND status = 'active'
					`)
					.bind(id)
					.first();

				if (adminCount && (adminCount.count as number) <= 1) {
					return c.json({
						success: false,
						error: "Cannot leave: You are the last admin. Please transfer admin rights or delete the group",
					}, 400);
				}
			}

			// Remove user from group
			await c.env.DB
				.prepare(`
					DELETE FROM group_members 
					WHERE group_id = ? AND user_id = ?
				`)
				.bind(id, user_id)
				.run();

			return {
				success: true,
				result: {
					message: "Successfully left the study group",
				},
			};
		} catch (error) {
			console.error("Error leaving study group:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to leave study group",
			}, 500);
		}
	}
}
