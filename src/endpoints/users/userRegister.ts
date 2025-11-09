import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";

export class UserRegister extends OpenAPIRoute {
	public schema = {
		tags: ["Authentication"],
		summary: "Register a new user",
		description: "Create a new user account with username, email, and password",
		request: {
			body: contentJson(
				z.object({
					username: z.string().min(3).max(50).describe("Username (3-50 characters)"),
					email: z.string().email().describe("Valid email address"),
					password: z.string().min(6).describe("Password (minimum 6 characters)"),
					goals: z.string().optional().describe("Learning goals"),
					study_preference: z.enum(["group", "one-on-one", "both"]).optional().describe("Study preference"),
				}),
			),
		},
		responses: {
			"200": {
				description: "User registered successfully",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						id: z.number(),
						username: z.string(),
						email: z.string(),
						goals: z.string().nullable(),
						study_preference: z.string().nullable(),
						created_at: z.string(),
					}),
				}),
			},
			"400": {
				description: "Bad request - validation error or user already exists",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { username, email, password, goals, study_preference } = data.body;

		// Check if user already exists
		const existingUser = await c.env.DB.prepare(
			"SELECT id FROM users WHERE username = ? OR email = ?"
		)
			.bind(username, email)
			.first();

		if (existingUser) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4001, message: "Username or email already exists" }],
				},
				400
			);
		}

		// In production, use proper password hashing (bcrypt, argon2, etc.)
		// For now, we'll use a simple hash placeholder
		const password_hash = await this.hashPassword(password);

		// Insert new user
		const result = await c.env.DB.prepare(
			`INSERT INTO users (username, email, password_hash, goals, study_preference, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
		)
			.bind(username, email, password_hash, goals || null, study_preference || null)
			.run();

		// Fetch the created user
		const newUser = await c.env.DB.prepare(
			"SELECT id, username, email, goals, study_preference, created_at FROM users WHERE id = ?"
		)
			.bind(result.meta.last_row_id)
			.first();

		return {
			success: true,
			result: newUser,
		};
	}

	// Simple password hashing (in production, use bcrypt or argon2)
	private async hashPassword(password: string): Promise<string> {
		// This is a placeholder. In production, use proper hashing
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}
}
