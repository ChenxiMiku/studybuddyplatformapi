// Send a message to a group
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env } from "../../types";
import { verifyAuth } from "../../middlewares/auth";

export class MessageSendGroup extends OpenAPIRoute {
	schema = {
		summary: "Send a group message",
		description: "Send a message to a study group",
		tags: ["Messages"],
		security: [{ BearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							group_id: z.number().int().positive().describe("The group's ID"),
							content: z.string().min(1).max(5000).describe("Message content"),
						}),
					},
				},
			},
		},
		responses: {
			"201": {
				description: "Message sent successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							result: z.object({
								message: z.object({
									id: z.number(),
									sender_id: z.number(),
									group_id: z.number(),
									content: z.string(),
									created_at: z.string(),
								}),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: any) {
		const authResult = await verifyAuth(c);
		if (!authResult.valid) {
			return c.json({ success: false, errors: authResult.errors }, 401);
		}

		const env = c.env as Env;
		const userId = authResult.userId!;
		const data = await this.getValidatedData<typeof this.schema>();
		const { group_id, content } = data.body;

		try {
			// Verify group exists
			const group = await env.DB.prepare(
				"SELECT id FROM study_groups WHERE id = ?"
			).bind(group_id).first();

			if (!group) {
				return c.json({
					success: false,
					errors: [{ code: 404, message: "Group not found" }],
				}, 404);
			}

			// Verify user is a member of the group
			const membership = await env.DB.prepare(
				"SELECT id FROM group_members WHERE group_id = ? AND user_id = ?"
			).bind(group_id, userId).first();

			if (!membership) {
				return c.json({
					success: false,
					errors: [{ code: 403, message: "You are not a member of this group" }],
				}, 403);
			}

			// Insert message
			const result = await env.DB.prepare(`
				INSERT INTO messages (sender_id, group_id, content)
				VALUES (?, ?, ?)
			`).bind(userId, group_id, content).run();

			if (!result.success) {
				throw new Error("Failed to insert message");
			}

			// Get the created message
			const message = await env.DB.prepare(`
				SELECT id, sender_id, group_id, content, created_at
				FROM messages
				WHERE id = ?
			`).bind(result.meta.last_row_id).first();

			return c.json({
				success: true,
				result: {
					message: message,
				},
			}, 201);
		} catch (error: any) {
			console.error("Error sending group message:", error);
			return c.json({
				success: false,
				errors: [{ code: 500, message: "Failed to send message" }],
			}, 500);
		}
	}
}
