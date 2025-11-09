import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint } from "./base";

/**
 * Join Study Group Endpoint
 * 
 * Join a public group or request to join a private group
 */
export class GroupJoin extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Join a study group",
		description: "Join a public study group immediately, or request to join a private group (requires admin approval).",
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
								.describe("ID of the user joining the group"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Successfully joined group or request sent",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						message: z.string(),
						status: z.enum(["active", "pending"]),
					}),
				}),
			},
			"400": {
				description: "Already a member or invalid request",
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
		const { user_id } = data.body;

		try {
			// Get group information
			const group = await this.getGroupById(c, id);

			if (!group) {
				return c.json({
					success: false,
					error: "Study group not found",
				}, 404);
			}

			// Check if user exists
			const userExists = await c.env.DB
				.prepare("SELECT id FROM users WHERE id = ?")
				.bind(user_id)
				.first();

			if (!userExists) {
				return c.json({
					success: false,
					error: "User not found",
				}, 404);
			}

			// Check if already a member
			const existingMembership = await c.env.DB
				.prepare(`
					SELECT status FROM group_members 
					WHERE group_id = ? AND user_id = ?
				`)
				.bind(id, user_id)
				.first();

			if (existingMembership) {
				if (existingMembership.status === "active") {
					return c.json({
						success: false,
						error: "Already a member of this group",
					}, 400);
				} else if (existingMembership.status === "pending") {
					return c.json({
						success: false,
						error: "Join request already pending",
					}, 400);
				}
			}

			// Determine status based on group privacy
			const status = group.is_private === 1 ? "pending" : "active";

			// Add user as member
			await c.env.DB
				.prepare(`
					INSERT INTO group_members (group_id, user_id, role, status)
					VALUES (?, ?, 'member', ?)
				`)
				.bind(id, user_id, status)
				.run();

			const message = status === "active"
				? "Successfully joined the study group"
				: "Join request sent. Waiting for admin approval";

			return {
				success: true,
				result: {
					message,
					status,
				},
			};
		} catch (error) {
			console.error("Error joining study group:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to join study group",
			}, 500);
		}
	}
}
