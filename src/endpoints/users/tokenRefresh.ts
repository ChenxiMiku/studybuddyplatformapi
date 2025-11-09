import { OpenAPIRoute, contentJson } from "chanfana";
import { z } from "zod";
import { AppContext } from "../../types";
import { verifyToken, generateTokenPair } from "../../utils/jwt";

export class TokenRefresh extends OpenAPIRoute {
	public schema = {
		tags: ["Authentication"],
		summary: "Refresh access token",
		description: "Use refresh token to get a new access token and refresh token pair",
		request: {
			body: contentJson(
				z.object({
					refreshToken: z.string().describe("Valid refresh token"),
				}),
			),
		},
		responses: {
			"200": {
				description: "Tokens refreshed successfully",
				...contentJson({
					success: z.boolean(),
					result: z.object({
						tokens: z.object({
							accessToken: z.string().describe("New JWT access token"),
							refreshToken: z.string().describe("New JWT refresh token"),
							expiresIn: z.number().describe("Access token expiration in seconds"),
						}),
					}),
				}),
			},
			"401": {
				description: "Invalid or expired refresh token",
			},
		},
	};

	public async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { refreshToken } = data.body;

		// Verify refresh token
		const payload = await verifyToken(refreshToken, c.env.JWT_SECRET, "refresh");

		if (!payload) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4014, message: "Invalid or expired refresh token" }],
				},
				401
			);
		}

		// Verify user still exists
		const user = await c.env.DB.prepare(
			"SELECT id, email FROM users WHERE id = ?"
		)
			.bind(payload.userId)
			.first();

		if (!user) {
			return c.json(
				{
					success: false,
					errors: [{ code: 4015, message: "User not found" }],
				},
				401
			);
		}

		// Generate new token pair
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
				tokens,
			},
		};
	}
}
