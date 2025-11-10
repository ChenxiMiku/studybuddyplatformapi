import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { UserModel } from "./base";
import { verifyToken } from "../../utils/jwt";

export class UserCurrentUpdate extends OpenAPIRoute {
	public schema = {
		tags: ["Users"],
		summary: "Update current user profile",
		description: "Update the authenticated user's profile information including bio, avatar, goals, and study preferences.",
		request: {
			body: {
				content: {
					"application/json": {
						schema: UserModel.schema.pick({
							username: true,
							email: true,
							bio: true,
							avatar_url: true,
							goals: true,
							study_preference: true,
						}).partial(),
					},
				},
			},
		},
		responses: {
			"200": {
				description: "User profile updated successfully",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						id: z.number(),
						username: z.string(),
						email: z.string(),
						bio: z.string().nullable(),
						avatar_url: z.string().nullable(),
						goals: z.string().nullable(),
						study_preference: z.string().nullable(),
						created_at: z.string(),
						updated_at: z.string(),
					}),
				}),
			},
			"401": {
				description: "Unauthorized - Invalid or missing token",
			},
			"404": {
				description: "User not found",
			},
		},
		security: [{ BearerAuth: [] }],
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const body = data.body;

		// Verify JWT token and get user ID
		const authHeader = c.req.header("Authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return c.json({ success: false, error: "Missing or invalid authorization header" }, 401);
		}

		const token = authHeader.substring(7);
		const payload = await verifyToken(token, c.env.JWT_SECRET, "access");

		if (!payload) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4012, message: "Invalid or expired token" }],
				},
				401
			);
		}

		const userId = payload.userId;

		// Build update query
		const updates: string[] = [];
		const values: any[] = [];

		if (body.username !== undefined) {
			updates.push("username = ?");
			values.push(body.username);
		}
		if (body.email !== undefined) {
			updates.push("email = ?");
			values.push(body.email);
		}
		if (body.bio !== undefined) {
			updates.push("bio = ?");
			values.push(body.bio);
		}
		if (body.avatar_url !== undefined) {
			updates.push("avatar_url = ?");
			values.push(body.avatar_url);
		}
		if (body.goals !== undefined) {
			updates.push("goals = ?");
			values.push(body.goals);
		}
		if (body.study_preference !== undefined) {
			updates.push("study_preference = ?");
			values.push(body.study_preference);
		}

		if (updates.length === 0) {
			return c.json({ success: false, error: "No fields to update" }, 400);
		}

		// Add updated_at
		updates.push("updated_at = CURRENT_TIMESTAMP");
		values.push(userId); // For WHERE clause

		const sql = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

		await c.env.DB.prepare(sql).bind(...values).run();

		// Fetch updated user
		const result = await c.env.DB.prepare(
			"SELECT id, username, email, bio, avatar_url, goals, study_preference, created_at, updated_at FROM users WHERE id = ?"
		)
			.bind(userId)
			.first();

		if (!result) {
			return c.json({ success: false, error: "User not found" }, 404);
		}

		return c.json({
			success: true,
			result: result,
		});
	}
}
