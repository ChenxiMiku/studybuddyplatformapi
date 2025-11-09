// Get group message history
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env } from "../../types";
import { verifyAuth } from "../../middlewares/auth";

export class MessageHistoryGroup extends OpenAPIRoute {
	schema = {
		summary: "Get group message history",
		description: "Get chat history for a study group",
		tags: ["Messages"],
		security: [{ BearerAuth: [] }],
		request: {
			params: z.object({
				groupId: z.string().regex(/^\d+$/).transform(Number).describe("The group's ID"),
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
									group_id: z.number(),
									content: z.string(),
									created_at: z.string(),
									sender_username: z.string(),
									is_online: z.boolean(),
								})),
								group: z.object({
									id: z.number(),
									name: z.string(),
									description: z.string().nullable(),
									member_count: z.number(),
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
		const groupId = data.params.groupId;
		const limit = data.query.limit;
		const offset = data.query.offset;

		try {
			// Verify group exists
			const group = await env.DB.prepare(
				"SELECT id, name, description FROM study_groups WHERE id = ?"
			).bind(groupId).first();

			if (!group) {
				return c.json({
					success: false,
					errors: [{ code: 404, message: "Group not found" }],
				}, 404);
			}

			// Verify user is a member of the group
			const membership = await env.DB.prepare(
				"SELECT id FROM group_members WHERE group_id = ? AND user_id = ?"
			).bind(groupId, userId).first();

			if (!membership) {
				return c.json({
					success: false,
					errors: [{ code: 403, message: "You are not a member of this group" }],
				}, 403);
			}

			// Get member count
			const memberCountResult = await env.DB.prepare(
				"SELECT COUNT(*) as count FROM group_members WHERE group_id = ?"
			).bind(groupId).first();

			const memberCount = memberCountResult?.count || 0;

			// Get total message count
			const countResult = await env.DB.prepare(`
				SELECT COUNT(*) as total
				FROM messages
				WHERE group_id = ?
			`).bind(groupId).first();

			const total = countResult?.total || 0;

			// Get messages with sender info
			const { results: messages } = await env.DB.prepare(`
				SELECT 
					m.id,
					m.sender_id,
					m.group_id,
					m.content,
					m.created_at,
					u.username as sender_username
				FROM messages m
				JOIN users u ON m.sender_id = u.id
				WHERE m.group_id = ?
				ORDER BY m.created_at DESC
				LIMIT ? OFFSET ?
			`).bind(groupId, limit, offset).all();

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
					group: {
						id: group.id,
						name: group.name,
						description: group.description,
						member_count: memberCount,
					},
					total: total,
				},
			});
		} catch (error: any) {
			console.error("Error fetching group message history:", error);
			return c.json({
				success: false,
				errors: [{ code: 500, message: "Failed to fetch group message history" }],
			}, 500);
		}
	}
}
