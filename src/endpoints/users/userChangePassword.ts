import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { hashPassword, comparePassword } from "../../utils/password";

export class UserChangePassword extends OpenAPIRoute {
	public schema = {
		tags: ["Users"],
		summary: "Change password",
		description: "Change password for a specific user. Requires valid authentication.",
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

		// Verify old password using bcrypt
		const isOldPasswordValid = await comparePassword(old_password, user.password_hash as string);
		
		if (!isOldPasswordValid) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4013, message: "Current password is incorrect" }],
				},
				401
			);
		}

		// Hash new password using bcrypt
		const new_password_hash = await hashPassword(new_password);
		
		// Update password
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
}
