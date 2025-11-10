// Get online status for multiple users
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import type { Env } from "../../types";
import { verifyAuth } from "../../middlewares/auth";

export class OnlineStatus extends OpenAPIRoute {
	schema = {
		summary: "Get users online status",
		description: "Check if specified users are currently online",
		tags: ["Messages"],
		security: [{ BearerAuth: [] }],
		request: {
			query: z.object({
				user_ids: z.string().describe("Comma-separated list of user IDs"),
			}),
		},
		responses: {
			"200": {
				description: "Online status retrieved successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							result: z.object({
								online_users: z.record(z.string(), z.boolean()),
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
		const data = await this.getValidatedData<typeof this.schema>();
		const userIdsStr = data.query.user_ids;

		try {
			// Parse user IDs
			const userIds = userIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

			if (userIds.length === 0) {
				return c.json({
					success: false,
					errors: [{ code: 400, message: "Invalid user_ids parameter" }],
				}, 400);
			}

			// Check online status for each user
			const onlineStatus: Record<string, boolean> = {};
			
			await Promise.all(
				userIds.map(async (userId) => {
					const status = await env.ONLINE_STATUS.get(`online:user:${userId}`);
					onlineStatus[userId.toString()] = status === "true";
				})
			);

			return c.json({
				success: true,
				result: {
					online_users: onlineStatus,
				},
			});
		} catch (error: any) {
			console.error("Error fetching online status:", error);
			return c.json({
				success: false,
				errors: [{ code: 500, message: "Failed to fetch online status" }],
			}, 500);
		}
	}
}
