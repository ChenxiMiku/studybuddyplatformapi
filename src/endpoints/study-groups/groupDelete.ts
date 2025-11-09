import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint } from "./base";

/**
 * Delete Study Group Endpoint
 * 
 * Admin-only endpoint to delete a study group
 */
export class GroupDelete extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Delete study group",
		description: "Admin-only: Permanently delete a study group and all its memberships.",
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
							admin_user_id: z.number()
								.int()
								.positive()
								.describe("ID of the admin performing the deletion"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Successfully deleted study group",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						message: z.string(),
					}),
				}),
			},
			"403": {
				description: "Insufficient permissions",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
			"404": {
				description: "Study group not found",
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
		const { admin_user_id } = data.body;

		try {
			// Check if requester is an admin
			const isAdmin = await this.isGroupAdmin(c, id, admin_user_id);

			if (!isAdmin) {
				return c.json({
					success: false,
					error: "Only group admins can delete the group",
				}, 403);
			}

			// Check if group exists
			const group = await this.getGroupById(c, id);

			if (!group) {
				return c.json({
					success: false,
					error: "Study group not found",
				}, 404);
			}

			// Delete the group (CASCADE will delete members automatically)
			await c.env.DB
				.prepare("DELETE FROM study_groups WHERE id = ?")
				.bind(id)
				.run();

			return {
				success: true,
				result: {
					message: "Study group deleted successfully",
				},
			};
		} catch (error) {
			console.error("Error deleting study group:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to delete study group",
			}, 500);
		}
	}
}
