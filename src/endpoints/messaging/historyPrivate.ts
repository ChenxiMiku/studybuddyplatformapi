// Get private message history with another user
import { OpenAPIRoute, Int } from "chanfana";
import { z } from "zod";
import type { Env } from "../../types";
import { verifyAuth } from "../../middlewares/auth";

export class MessageHistoryPrivate extends OpenAPIRoute {
	schema = {
		summary: "Get private message history",
		description: "Get chat history between the authenticated user and another user",
		tags: ["Messages"],
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				peerId: z.string().regex(/^\d+$/).transform(Number).describe("The other user's ID"),
			}),
			query: z.object({
				limit: z.string().optional().default("50").transform(Number).describe("Maximum number of messages to return"),
				offset: z.string().optional().default("0").transform(Number).describe("Number of messages to skip"),
			}),
		},
		responses: {
			"200": {
				description: "Message history retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							result: z.object({
								messages: z.array(z.object({
									id: z.number(),
									sender_id: z.number(),
									receiver_id: z.number(),
									content: z.string(),
									created_at: z.string(),
									sender_username: z.string(),
									is_online: z.boolean(),
								})),
								peer: z.object({
									id: z.number(),
									username: z.string(),
									email: z.string(),
									is_online: z.boolean(),
								}),
								total: z.number(),
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
		const peerId = data.params.peerId;
		const limit = data.query.limit;
		const offset = data.query.offset;

		try {
			// Verify peer user exists
			const peer = await env.DB.prepare(
				"SELECT id, username, email FROM users WHERE id = ?"
			).bind(peerId).first();

			if (!peer) {
				return c.json({
					success: false,
					errors: [{ code: 404, message: "User not found" }],
				}, 404);
			}

			// Check if peer is online using KV
			const peerOnline = await env.ONLINE_STATUS.get(`online:user:${peerId}`);

			// Get total message count
			const countResult = await env.DB.prepare(`
				SELECT COUNT(*) as total
				FROM messages
				WHERE (sender_id = ? AND receiver_id = ?)
				   OR (sender_id = ? AND receiver_id = ?)
			`).bind(userId, peerId, peerId, userId).first();

			const total = countResult?.total || 0;

			// Get messages with sender info
			const { results: messages } = await env.DB.prepare(`
				SELECT 
					m.id,
					m.sender_id,
					m.receiver_id,
					m.content,
					m.created_at,
					u.username as sender_username
				FROM messages m
				JOIN users u ON m.sender_id = u.id
				WHERE (m.sender_id = ? AND m.receiver_id = ?)
				   OR (m.sender_id = ? AND m.receiver_id = ?)
				ORDER BY m.created_at DESC
				LIMIT ? OFFSET ?
			`).bind(userId, peerId, peerId, userId, limit, offset).all();

			// Check online status for each unique sender
			const messagesWithStatus = await Promise.all(
				messages.map(async (msg: any) => {
					const senderOnline = await env.ONLINE_STATUS.get(`online:user:${msg.sender_id}`);
					return {
						...msg,
						is_online: senderOnline === "true",
					};
				})
			);

			return c.json({
				success: true,
				result: {
					messages: messagesWithStatus,
					peer: {
						id: peer.id,
						username: peer.username,
						email: peer.email,
						is_online: peerOnline === "true",
					},
					total: total,
				},
			});
		} catch (error: any) {
			console.error("Error fetching message history:", error);
			return c.json({
				success: false,
				errors: [{ code: 500, message: "Failed to fetch message history" }],
			}, 500);
		}
	}
}
