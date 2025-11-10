// Send a private message to another user
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env } from "../../types";
import { verifyAuth } from "../../middlewares/auth";

export class MessageSendPrivate extends OpenAPIRoute {
	schema = {
		summary: "Send a private message",
		description: "Send a private message to another user",
		tags: ["Messages"],
		security: [{ BearerAuth: [] }],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							receiver_id: z.number().int().positive().describe("The recipient user's ID"),
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
									receiver_id: z.number(),
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
		const { receiver_id, content } = data.body;

		try {
			// Verify receiver exists
			const receiver = await env.DB.prepare(
				"SELECT id FROM users WHERE id = ?"
			).bind(receiver_id).first();

			if (!receiver) {
				return c.json({
					success: false,
					errors: [{ code: 404, message: "Receiver not found" }],
				}, 404);
			}

			// Cannot send message to self
			if (userId === receiver_id) {
				return c.json({
					success: false,
					errors: [{ code: 400, message: "Cannot send message to yourself" }],
				}, 400);
			}

			// Insert message
			const result = await env.DB.prepare(`
				INSERT INTO messages (sender_id, receiver_id, content)
				VALUES (?, ?, ?)
			`).bind(userId, receiver_id, content).run();

			if (!result.success) {
				throw new Error("Failed to insert message");
			}

			// Get the created message
			const message = await env.DB.prepare(`
				SELECT id, sender_id, receiver_id, content, created_at
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
			console.error("Error sending private message:", error);
			return c.json({
				success: false,
				errors: [{ code: 500, message: "Failed to send message" }],
			}, 500);
		}
	}
}
