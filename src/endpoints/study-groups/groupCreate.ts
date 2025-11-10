import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint, StudyGroupSchema } from "./base";

/**
 * Create Study Group Endpoint
 * 
 * Allows authenticated users to create a new study group
 */
export class GroupCreate extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Create a new study group",
		description: "Create a new study group with specified name, description, and privacy settings. The creator automatically becomes the group admin.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string()
								.min(3, "Group name must be at least 3 characters")
								.max(100, "Group name must be at most 100 characters")
								.describe("Name of the study group"),
							description: z.string()
								.max(1000, "Description must be at most 1000 characters")
								.optional()
								.describe("Description of the study group's purpose and goals"),
							cover_image_url: z.string()
								.url("Must be a valid URL")
								.optional()
								.describe("URL of the group's cover image"),
							is_private: z.boolean()
								.default(false)
								.describe("Whether the group is private (requires invitation) or public"),
							created_by_user_id: z.number()
								.int()
								.positive()
								.describe("ID of the user creating the group"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Study group created successfully",
				...contentJson({
					success: z.boolean(),
					result: StudyGroupSchema.extend({
						message: z.string(),
					}),
				}),
			},
			"400": {
				description: "Invalid input data",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { name, description, cover_image_url, is_private, created_by_user_id } = data.body;

		try {
			// Check if user exists
			const userExists = await c.env.DB
				.prepare("SELECT id FROM users WHERE id = ?")
				.bind(created_by_user_id)
				.first();

			if (!userExists) {
				return c.json({
					success: false,
					error: "User not found",
				}, 404);
			}

			// Create the study group
			const createResult = await c.env.DB
				.prepare(`
					INSERT INTO study_groups (name, description, cover_image_url, created_by_user_id, is_private)
					VALUES (?, ?, ?, ?, ?)
				`)
				.bind(
					name,
					description || null,
					cover_image_url || null,
					created_by_user_id,
					is_private ? 1 : 0
				)
				.run();

			const groupId = createResult.meta.last_row_id;

			// Add creator as admin member
			await c.env.DB
				.prepare(`
					INSERT INTO group_members (group_id, user_id, role, status)
					VALUES (?, ?, 'admin', 'active')
				`)
				.bind(groupId, created_by_user_id)
				.run();

			// Fetch the created group
			const newGroup = await c.env.DB
				.prepare("SELECT * FROM study_groups WHERE id = ?")
				.bind(groupId)
				.first();

			if (!newGroup) {
				return c.json({
					success: false,
					error: "Failed to retrieve created group",
				}, 500);
			}

			return {
				success: true,
				result: {
					...newGroup,
					is_private: newGroup.is_private === 1,
					message: "Study group created successfully",
				},
			};
		} catch (error) {
			console.error("Error creating study group:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to create study group",
			}, 500);
		}
	}
}
