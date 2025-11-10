import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { hashPassword } from "../../utils/password";
import { generateTokenPair } from "../../utils/jwt";

export class UserRegister extends OpenAPIRoute {
	public schema = {
		tags: ["Authentication"],
		summary: "Register a new user",
		description: "Create a new user account with username, email, and password. Returns JWT tokens for immediate login.",
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
				description: "User registered successfully with JWT tokens",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						user: z.object({
							id: z.number(),
							username: z.string(),
							email: z.string(),
							goals: z.string().nullable(),
							study_preference: z.string().nullable(),
							created_at: z.string(),
						}),
						tokens: z.object({
							accessToken: z.string().describe("JWT access token (short-lived)"),
							refreshToken: z.string().describe("JWT refresh token (long-lived)"),
							expiresIn: z.number().describe("Access token expiration in seconds"),
						}),
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

		// Hash password using bcrypt
		const password_hash = await hashPassword(password);

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

		if (!newUser) {
			return c.json(
				{
					success: false,
					errors: [{ code: 5001, message: "Failed to create user" }],
				},
				500
			);
		}

		// Generate JWT token pair
		const tokens = await generateTokenPair(
			{
				userId: newUser.id as number,
				email: newUser.email as string,
			},
			c.env.JWT_SECRET,
			c.env.JWT_ACCESS_EXPIRATION,
			c.env.JWT_REFRESH_EXPIRATION
		);

		return {
			success: true,
			result: {
				user: newUser,
				tokens,
			},
		};
	}
}
