import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { comparePassword } from "../../utils/password";
import { generateTokenPair } from "../../utils/jwt";

export class UserLogin extends OpenAPIRoute {
	public schema = {
		tags: ["Authentication"],
		summary: "User login",
		description: "Authenticate user with username/email and password. Returns JWT access and refresh tokens.",
		request: {
			body: contentJson(
				z.object({
					username_or_email: z.string().describe("Username or email"),
					password: z.string().describe("Password"),
				}),
			),
		},
		responses: {
			"200": {
				description: "Login successful with JWT tokens",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						user: z.object({
							id: z.number(),
							username: z.string(),
							email: z.string(),
							goals: z.string().nullable(),
							study_preference: z.string().nullable(),
						}),
						tokens: z.object({
							accessToken: z.string().describe("JWT access token (short-lived)"),
							refreshToken: z.string().describe("JWT refresh token (long-lived)"),
							expiresIn: z.number().describe("Access token expiration in seconds"),
						}),
					}),
				}),
			},
			"401": {
				description: "Invalid credentials",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { username_or_email, password } = data.body;

		// Find user by username or email
		const user = await c.env.DB.prepare(
			`SELECT id, username, email, password_hash, goals, study_preference 
			 FROM users 
			 WHERE username = ? OR email = ?`
		)
			.bind(username_or_email, username_or_email)
			.first();

		if (!user) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4011, message: "Invalid username/email or password" }],
				},
				401
			);
		}

		// Verify password using bcrypt
		const isPasswordValid = await comparePassword(password, user.password_hash as string);
		
		if (!isPasswordValid) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4012, message: "Invalid username/email or password" }],
				},
				401
			);
		}

		// Generate JWT token pair
		const tokens = await generateTokenPair(
			{
				userId: user.id as number,
				email: user.email as string,
			},
			c.env.JWT_SECRET,
			c.env.JWT_ACCESS_EXPIRATION,
			c.env.JWT_REFRESH_EXPIRATION
		);

		return {
			success: true,
			result: {
				user: {
					id: user.id,
					username: user.username,
					email: user.email,
					goals: user.goals,
					study_preference: user.study_preference,
				},
				tokens,
			},
		};
	}
}
