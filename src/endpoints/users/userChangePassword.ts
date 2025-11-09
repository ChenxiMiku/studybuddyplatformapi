import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";

export class UserChangePassword extends OpenAPIRoute {
	public schema = {
		tags: ["Users"],
		summary: "Change password",
		description: "Change password for a specific user",
		request: {
			params: z.object({
				id: z.string().transform(Number).describe("User ID"),
			}),
			body: contentJson(
				z.object({
					old_password: z.string().describe("Current password"),
					new_password: z.string().min(6).describe("New password (minimum 6 characters)"),
				}),
			),
		},
		responses: {
			"200": {
				description: "Password changed successfully",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						message: z.string(),
					}),
				}),
			},
			"401": {
				description: "Invalid current password",
			},
			"404": {
				description: "User not found",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const userId = data.params.id;
		const { old_password, new_password } = data.body;

		// Get current user
		const user = await c.env.DB.prepare(
			"SELECT password_hash FROM users WHERE id = ?"
		)
			.bind(userId)
			.first();

		if (!user) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4041, message: "User not found" }],
				},
				404
			);
		}

		// Verify old password
		const old_password_hash = await this.hashPassword(old_password);
		if (old_password_hash !== user.password_hash) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4013, message: "Current password is incorrect" }],
				},
				401
			);
		}

		// Update password
		const new_password_hash = await this.hashPassword(new_password);
		await c.env.DB.prepare(
			"UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?"
		)
			.bind(new_password_hash, userId)
			.run();

		return {
			success: true,
			result: {
				message: "Password changed successfully",
			},
		};
	}

	private async hashPassword(password: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}
}
