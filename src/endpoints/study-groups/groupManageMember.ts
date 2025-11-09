import { contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { StudyGroupsEndpoint } from "./base";

/**
 * Manage Group Member Endpoint
 * 
 * Admin-only endpoint to manage group members
 */
export class GroupManageMember extends StudyGroupsEndpoint {
	public schema = {
		tags: ["Study Groups"],
		summary: "Manage group member",
		description: "Admin-only: Approve/reject join requests, promote/demote members, or remove members from the group.",
		request: {
			params: z.object({
				id: z.string()
					.transform(Number)
					.describe("Study group ID"),
				userId: z.string()
					.transform(Number)
					.describe("User ID of the member to manage"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							admin_user_id: z.number()
								.int()
								.positive()
								.describe("ID of the admin performing the action"),
							action: z.enum(["approve", "reject", "remove", "promote", "demote"])
								.describe("Action to perform on the member"),
						}),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Successfully managed group member",
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
				description: "Group or member not found",
				...contentJson({
					success: z.boolean(),
					error: z.string(),
				}),
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { id, userId } = data.params;
		const { admin_user_id, action } = data.body;

		try {
			// Check if requester is an admin
			const isAdmin = await this.isGroupAdmin(c, id, admin_user_id);

			if (!isAdmin) {
				return c.json({
					success: false,
					error: "Only group admins can manage members",
				}, 403);
			}

			// Check if target user is a member
			const membership = await c.env.DB
				.prepare(`
					SELECT role, status FROM group_members 
					WHERE group_id = ? AND user_id = ?
				`)
				.bind(id, userId)
				.first();

			if (!membership && action !== "approve") {
				return c.json({
					success: false,
					error: "User is not a member of this group",
				}, 404);
			}

			let message = "";

			switch (action) {
				case "approve":
					// Approve pending join request
					if (membership?.status === "pending") {
						await c.env.DB
							.prepare(`
								UPDATE group_members 
								SET status = 'active' 
								WHERE group_id = ? AND user_id = ?
							`)
							.bind(id, userId)
							.run();
						message = "Join request approved";
					} else {
						return c.json({
							success: false,
							error: "No pending join request found",
						}, 400);
					}
					break;

				case "reject":
					// Reject pending join request
					if (membership?.status === "pending") {
						await c.env.DB
							.prepare(`
								UPDATE group_members 
								SET status = 'rejected' 
								WHERE group_id = ? AND user_id = ?
							`)
							.bind(id, userId)
							.run();
						message = "Join request rejected";
					} else {
						return c.json({
							success: false,
							error: "No pending join request found",
						}, 400);
					}
					break;

				case "remove":
					// Remove member from group
					await c.env.DB
						.prepare(`
							DELETE FROM group_members 
							WHERE group_id = ? AND user_id = ?
						`)
						.bind(id, userId)
						.run();
					message = "Member removed from group";
					break;

				case "promote":
					// Promote member to admin
					if (membership?.status === "active") {
						await c.env.DB
							.prepare(`
								UPDATE group_members 
								SET role = 'admin' 
								WHERE group_id = ? AND user_id = ?
							`)
							.bind(id, userId)
							.run();
						message = "Member promoted to admin";
					} else {
						return c.json({
							success: false,
							error: "Member must be active to be promoted",
						}, 400);
					}
					break;

				case "demote":
					// Demote admin to member
					if (membership?.role === "admin") {
						// Check if this is the last admin
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
								error: "Cannot demote the last admin",
							}, 400);
						}

						await c.env.DB
							.prepare(`
								UPDATE group_members 
								SET role = 'member' 
								WHERE group_id = ? AND user_id = ?
							`)
							.bind(id, userId)
							.run();
						message = "Admin demoted to member";
					} else {
						return c.json({
							success: false,
							error: "User is not an admin",
						}, 400);
					}
					break;
			}

			return {
				success: true,
				result: {
					message,
				},
			};
		} catch (error) {
			console.error("Error managing group member:", error);
			return c.json({
				success: false,
				error: error instanceof Error ? error.message : "Failed to manage group member",
			}, 500);
		}
	}
}
