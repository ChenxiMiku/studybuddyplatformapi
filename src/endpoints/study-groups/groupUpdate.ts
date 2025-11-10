import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint, StudyGroupSchema } from "./base";

/**
 * Update Study Group Endpoint
 * 
 * Admin-only endpoint to update group information
 */
export class GroupUpdate extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Update study group",
		description: "Admin-only: Update study group name, description, cover image, or privacy settings.",
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
								.describe("ID of the admin performing the update"),
							name: z.string()
								.min(3)
								.max(100)
								.optional()
								.describe("New name of the study group"),
							description: z.string()
								.max(1000)
								.optional()
								.describe("New description of the study group"),
							cover_image_url: z.string()
								.url()
								.optional()
								.describe("New cover image URL"),
							is_private: z.boolean()
								.optional()
								.describe("New privacy setting"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Successfully updated study group",
				...contentJson({
					success: z.boolean(),
					result: StudyGroupSchema,
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
		const { admin_user_id, name, description, cover_image_url, is_private } = data.body;

		try {
			// Check if requester is an admin
			const isAdmin = await this.isGroupAdmin(c, id, admin_user_id);

			if (!isAdmin) {
				return c.json({
					success: false,
					error: "Only group admins can update group information",
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

			// Build update query dynamically
			const updates: string[] = [];
			const params: any[] = [];

			if (name !== undefined) {
				updates.push("name = ?");
				params.push(name);
			}

			if (description !== undefined) {
				updates.push("description = ?");
				params.push(description);
			}

			if (cover_image_url !== undefined) {
				updates.push("cover_image_url = ?");
				params.push(cover_image_url);
			}

			if (is_private !== undefined) {
				updates.push("is_private = ?");
				params.push(is_private ? 1 : 0);
			}

			if (updates.length === 0) {
				return c.json({
					success: false,
					error: "No fields to update",
				}, 400);
			}

			updates.push("updated_at = CURRENT_TIMESTAMP");
			params.push(id);

			// Execute update
			await c.env.DB
				.prepare(`
					UPDATE study_groups 
					SET ${updates.join(", ")} 
					WHERE id = ?
				`)
				.bind(...params)
				.run();

			// Fetch updated group
			const updatedGroup = await this.getGroupById(c, id);

			return {
				success: true,
				result: {
					...updatedGroup,
					is_private: updatedGroup.is_private === 1,
				},
			};
		} catch (error) {
			console.error("Error updating study group:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to update study group",
			}, 500);
		}
	}
}
