import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";

export class UserLogin extends OpenAPIRoute {
	public schema = {
		tags: ["Authentication"],
		summary: "User login",
		description: "Authenticate user with username/email and password",
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
				description: "Login successful",
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
						token: z.string().describe("Authentication token (placeholder)"),
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

		// Verify password
		const password_hash = await this.hashPassword(password);
		if (password_hash !== user.password_hash) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4012, message: "Invalid username/email or password" }],
				},
				401
			);
		}

		// In production, generate a real JWT token
		const token = await this.generateToken(user.id as number);

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
				token,
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

	private async generateToken(userId: number): Promise<string> {
		// Placeholder token generation
		// In production, use JWT with proper signing
		const tokenData = `${userId}:${Date.now()}`;
		const encoder = new TextEncoder();
		const data = encoder.encode(tokenData);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
	}
}
